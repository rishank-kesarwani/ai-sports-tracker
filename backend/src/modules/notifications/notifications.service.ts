import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationServiceClient, SendNotificationPayload } from './notification-service.client';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly notificationClient: NotificationServiceClient,
    private readonly usersService: UsersService,
  ) {}

  async dispatchNotification(payload: {
    userId: string;
    title: string;
    message: string;
    type: 'MATCH_STARTING' | 'MATCH_RESULT' | 'TEAM_UPDATE' | 'PLAYER_UPDATE' | 'WEEKLY_SPORTS_DIGEST';
    channel?: 'IN_APP' | 'EMAIL' | 'PUSH';
    data?: Record<string, any>;
  }) {
    // 1. Create In-App Notification Record
    const record = await this.notificationModel.create({
      userId: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      channel: payload.channel || 'IN_APP',
      data: payload.data || {},
      read: false,
    });

    // 2. Fetch user preferences to check email/push settings
    const user = await this.usersService.findById(payload.userId);
    if (!user) return record;

    const userPrefs = user.preferences?.notificationSettings;
    const isChannelEnabled = userPrefs?.channels?.includes(payload.channel || 'EMAIL') ?? true;

    // 3. Asynchronously call shared Notification Service if channel is EMAIL/PUSH
    if (isChannelEnabled && payload.channel && payload.channel !== 'IN_APP') {
      const clientPayload: SendNotificationPayload = {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        channel: payload.channel as any,
        recipientEmail: user.email,
        data: payload.data,
      };

      this.notificationClient.sendNotification(clientPayload).catch((err) => {
        this.logger.warn(`External notification dispatch failed: ${err.message}`);
      });
    }

    return record;
  }

  async getUserNotifications(userId: string, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const [items, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId }),
      this.notificationModel.countDocuments({ userId, read: false }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        unreadCount,
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notif = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true },
    );
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    return notif;
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
    return { success: true, message: 'All notifications marked as read' };
  }
}
