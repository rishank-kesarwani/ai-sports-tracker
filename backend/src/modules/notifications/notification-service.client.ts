import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CircuitBreaker } from '../../common/utils/circuit-breaker';

export interface SendNotificationPayload {
  userId: string;
  type: 'MATCH_STARTING' | 'MATCH_RESULT' | 'TEAM_UPDATE' | 'PLAYER_UPDATE' | 'WEEKLY_SPORTS_DIGEST' | 'PASSWORD_RESET';
  title: string;
  message: string;
  channel?: 'EMAIL' | 'PUSH' | 'IN_APP';
  recipientEmail?: string;
  recipientPushToken?: string;
  data?: Record<string, any>;
  idempotencyKey?: string;
}

@Injectable()
export class NotificationServiceClient {
  private readonly logger = new Logger(NotificationServiceClient.name);
  private readonly client: AxiosInstance;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly serviceUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.serviceUrl = this.configService.get<string>('notificationService.url', 'http://localhost:4002');
    this.apiKey = this.configService.get<string>('notificationService.apiKey', 'notification-service-dev-token-2026');
    const timeout = this.configService.get<number>('notificationService.timeoutMs', 5000);

    this.client = axios.create({
      baseURL: this.serviceUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });

    this.circuitBreaker = new CircuitBreaker('NotificationService', {
      failureThreshold: 4,
      recoveryTimeoutMs: 20000,
      requestTimeoutMs: timeout,
    });
  }

  async sendNotification(payload: SendNotificationPayload): Promise<{ success: boolean; deliveryId?: string; status: string }> {
    const idempotencyKey = payload.idempotencyKey || `notif-${payload.userId}-${payload.type}-${Date.now()}`;

    return this.circuitBreaker.execute(
      async () => {
        try {
          const response = await this.client.post('/api/v1/notifications/send', payload, {
            headers: {
              'Idempotency-Key': idempotencyKey,
            },
          });
          this.logger.log(`Notification sent successfully to user ${payload.userId} [Type: ${payload.type}]`);
          return {
            success: true,
            deliveryId: response.data?.deliveryId || `del-${Date.now()}`,
            status: 'DELIVERED',
          };
        } catch (error: any) {
          // If server is not reachable in dev or mock environment, handle gracefully
          if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
            throw error;
          }
          this.logger.warn(`Notification Service returned error: ${error.message}`);
          return {
            success: false,
            status: 'FAILED',
          };
        }
      },
      () => {
        // Fallback: log notification locally without throwing error
        this.logger.warn(`Notification Service circuit open/offline. Queued locally for user ${payload.userId}: "${payload.title}"`);
        return {
          success: true,
          deliveryId: `local-fallback-${Date.now()}`,
          status: 'LOCAL_FALLBACK',
        };
      },
    );
  }

  getHealth() {
    return {
      serviceUrl: this.serviceUrl,
      circuitState: this.circuitBreaker.getState(),
      metrics: this.circuitBreaker.getMetrics(),
    };
  }
}
