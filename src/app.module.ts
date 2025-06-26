import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MongooseModule.forRoot('mongodb+srv://petrichore:bebelaur3t@petricator.zbaml.mongodb.net/?retryWrites=true&w=majority&appName=Petricator')
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
