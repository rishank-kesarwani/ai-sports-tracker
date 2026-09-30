import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true, unique: true, index: true })
  externalId: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ index: true })
  shortName?: string;

  @Prop({ required: true, index: true })
  sport: string;

  @Prop({ index: true })
  leagueId?: string;

  @Prop()
  leagueName?: string;

  @Prop()
  country?: string;

  @Prop()
  stadium?: string;

  @Prop()
  stadiumCapacity?: number;

  @Prop()
  badgeUrl?: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  bannerUrl?: string;

  @Prop()
  jerseyUrl?: string;

  @Prop()
  formedYear?: number;

  @Prop()
  description?: string;

  @Prop()
  website?: string;

  @Prop({ type: Object, default: {} })
  socials?: Record<string, string>;

  @Prop({ type: Object, default: {} })
  stats?: Record<string, any>;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
TeamSchema.index({ name: 'text', shortName: 'text' });
TeamSchema.index({ sport: 1, leagueId: 1 });
