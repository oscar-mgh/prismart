import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'reviews', timestamps: true })
export class ReviewDocument extends Document {
  @Prop({ required: true, index: true })
  productId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: false })
  reviewImage?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(ReviewDocument);

ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
