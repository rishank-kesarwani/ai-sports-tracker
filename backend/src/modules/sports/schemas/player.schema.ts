import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerDocument = Player & Document;

@Schema({ timestamps: true })
export class Player {
  @Prop({ required: true, unique: true, index: true })
  externalId: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ index: true })
  teamId?: string;

  @Prop()
  teamName?: string;

  @Prop({ required: true, index: true })
  sport: string;

  @Prop()
  nationality?: string;

  @Prop()
  position?: string;

  @Prop()
  dateOfBirth?: string;

  @Prop()
  height?: string;

  @Prop()
  weight?: string;

  @Prop()
  thumbUrl?: string;

  @Prop()
  cutoutUrl?: string;

  @Prop()
  bannerUrl?: string;

  @Prop()
  description?: string;

  @Prop()
  jerseyNumber?: string;

  @Prop({ type: Object, default: {} })
  stats?: Record<string, any>;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
PlayerSchema.index({ name: 'text' });
PlayerSchema.index({ sport: 1, teamId: 1 });
