import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MongooseModule.forRoot(process.env.DB_URL || ''),
    ConfigModule.forRoot({ isGlobal: true })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
