import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CartItemDocument {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

@Schema({ timestamps: true, collection: 'carts' })
export class CartDocument extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: [SchemaFactory.createForClass(CartItemDocument)], default: [] })
  items: CartItemDocument[];

  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(CartDocument);
