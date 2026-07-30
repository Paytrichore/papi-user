import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserEntitySchema } from './user.model';
import { UserWebhookController } from './user-webhook.controller';
import { WebhookSignatureService } from './webhook-signature.service';
import { UserRealtimeService } from './user-realtime.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserEntitySchema },
    ]),
  ],
  controllers: [UserController, UserWebhookController],
  providers: [UserService, WebhookSignatureService, UserRealtimeService],
  exports: [UserService],
})
export class UserModule {}
