import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MatchStatus, SportType } from '../../../common/interfaces/sports.interface';

export type MatchDocument = Match & Document;

@Schema({ timestamps: true })
export class Match {
  @Prop({ required: true, unique: true, index: true })
  externalId: string; // e.g. "match-live-101" or provider ID

  @Prop({ required: true, enum: Object.values(SportType), index: true })
  sport: string;

  @Prop({ required: true, index: true })
  leagueId: string;

  @Prop({ required: true })
  leagueName: string;

  @Prop()
  season?: string;

  @Prop()
  round?: string;

  @Prop({
    type: {
      id: { type: String, required: true, index: true },
      name: { type: String, required: true },
      badgeUrl: String,
      score: { type: SchemaFactory.createForClass(Object) },
      subScores: [String],
    },
    required: true,
  })
  homeTeam: {
    id: string;
    name: string;
    badgeUrl?: string;
    score?: any;
    subScores?: string[];
  };

  @Prop({
    type: {
      id: { type: String, required: true, index: true },
      name: { type: String, required: true },
      badgeUrl: String,
      score: { type: SchemaFactory.createForClass(Object) },
      subScores: [String],
    },
    required: true,
  })
  awayTeam: {
    id: string;
    name: string;
    badgeUrl?: string;
    score?: any;
    subScores?: string[];
  };

  @Prop({ required: true, index: true })
  startTime: Date;

  @Prop({ required: true, enum: Object.values(MatchStatus), default: MatchStatus.SCHEDULED, index: true })
  status: string;

  @Prop()
  minute?: string;

  @Prop()
  venue?: string;

  @Prop()
  referee?: string;

  @Prop()
  spectators?: number;

  @Prop({ type: [Object], default: [] })
  events: Array<any>;

  @Prop({ type: Object, default: {} })
  stats: Record<string, any>;

  @Prop()
  aiSummary?: string;

  @Prop({ default: Date.now })
  lastSyncedAt: Date;

  @Prop({ default: 'cached', enum: ['live', 'near-real-time', 'cached'] })
  freshness: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Specified Compound Indexes
MatchSchema.index({ startTime: -1 });
MatchSchema.index({ leagueId: 1, startTime: -1 });
MatchSchema.index({ 'homeTeam.id': 1, startTime: -1 });
MatchSchema.index({ 'awayTeam.id': 1, startTime: -1 });
MatchSchema.index({ status: 1, sport: 1 });
