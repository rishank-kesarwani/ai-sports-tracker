import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeagueDocument = League & Document;

@Schema({ timestamps: true })
export class League {
  @Prop({ required: true, unique: true, index: true })
  externalId: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, index: true })
  sport: string;

  @Prop()
  country?: string;

  @Prop()
  badgeUrl?: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  bannerUrl?: string;

  @Prop()
  currentSeason?: string;

  @Prop()
  description?: string;

  @Prop({ type: [Object], default: [] })
  standings?: Array<any>;
}

export const LeagueSchema = SchemaFactory.createForClass(League);
LeagueSchema.index({ sport: 1, name: 1 });
