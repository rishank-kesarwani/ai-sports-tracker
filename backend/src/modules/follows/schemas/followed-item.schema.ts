import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FollowedItemDocument = FollowedItem & Document;

@Schema({ timestamps: true })
export class FollowedItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['team', 'player', 'league'], index: true })
  itemType: 'team' | 'player' | 'league';

  @Prop({ required: true, index: true })
  itemId: string; // e.g. "team-133604" or "league-4328"

  @Prop({ required: true })
  itemName: string;

  @Prop()
  itemBadgeUrl?: string;

  @Prop()
  sport?: string;
}

export const FollowedItemSchema = SchemaFactory.createForClass(FollowedItem);

// Compound Unique Indexes preventing duplicates per user
FollowedItemSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });
