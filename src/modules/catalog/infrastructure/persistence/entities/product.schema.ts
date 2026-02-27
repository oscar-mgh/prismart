import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'products', timestamps: true })
export class ProductDocument extends Document {
  @Prop({ required: true, index: true })
  storeId: string;
  @Prop({ unique: true, required: true }) sku: string;
  @Prop({ required: true }) name: string;
  @Prop() description: string;
  @Prop({ required: true }) price: number;
  @Prop({ required: true }) stock: number;
  @Prop({ default: true }) active: boolean;
  @Prop({ required: true }) category: string;
  @Prop({ default: 0 }) purchaseCount: number;

  @Prop({
    type: {
      code: String,
      percentage: Number,
      expirationDate: Date,
    },
    _id: false,
    required: false,
  })
  discount?: {
    code: string;
    percentage: number;
    expirationDate: Date;
  };
}
export const ProductSchema = SchemaFactory.createForClass(ProductDocument);
