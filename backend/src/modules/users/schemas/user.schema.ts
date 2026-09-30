import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;

  @Prop({ default: null })
  refreshTokenHash?: string;

  @Prop({ default: null })
  resetPasswordTokenHash?: string;

  @Prop({ default: null })
  resetPasswordExpires?: Date;

  @Prop({
    type: {
      followedTeams: { type: [String], default: [] },
      followedLeagues: { type: [String], default: [] },
      followedPlayers: { type: [String], default: [] },
      followedSports: { type: [String], default: ['Soccer', 'Basketball', 'Cricket', 'Tennis'] },
      notificationSettings: {
        matchStarting: { type: Boolean, default: true },
        matchResult: { type: Boolean, default: true },
        teamNews: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false },
        channels: { type: [String], default: ['IN_APP', 'EMAIL'] },
      },
    },
    default: {
      followedTeams: [],
      followedLeagues: [],
      followedPlayers: [],
      followedSports: ['Soccer', 'Basketball', 'Cricket', 'Tennis'],
      notificationSettings: {
        matchStarting: true,
        matchResult: true,
        teamNews: true,
        weeklyDigest: false,
        channels: ['IN_APP', 'EMAIL'],
      },
    },
  })
  preferences: {
    followedTeams: string[];
    followedLeagues: string[];
    followedPlayers: string[];
    followedSports: string[];
    notificationSettings: {
      matchStarting: boolean;
      matchResult: boolean;
      teamNews: boolean;
      weeklyDigest: boolean;
      channels: string[];
    };
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
