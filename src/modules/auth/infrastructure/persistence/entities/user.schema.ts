import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../domain/entities/user.entity';
import { Types } from 'mongoose';

@Schema({ collection: 'users' })
export class UserDocument extends Document {
  @Prop({ required: true }) username: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop({ enum: UserRole, default: UserRole.CUSTOMER }) role: UserRole;
  @Prop({ default: true }) active: boolean;
  @Prop() storeId?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
