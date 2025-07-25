import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserEntity {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 10 })
  actionPoints: number;

  @Prop()
  nextDLA: Date;

  @Prop({ default: false })
  drafted: boolean;
}

export type UserDocument = UserEntity & Document;
export const UserEntitySchema = SchemaFactory.createForClass(UserEntity);
