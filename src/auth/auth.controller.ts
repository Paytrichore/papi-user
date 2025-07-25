import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDTO } from 'src/user/dto/createUser.dto';
import { UserService } from 'src/user/user.service';
import { Types } from 'mongoose';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirige vers Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    // req.user contient { access_token, user }
    return req.user;
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDTO) {
    const existing = await this.userService.findByEmail(createUserDto.email);
    if (existing) {
      throw new HttpException(
        { error: { code: 'EMAIL_ALREADY_IN_USE' } },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userService.createUser(createUserDto);
    const token = await this.authService.login(user);
    return { access_token: token, user };
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new HttpException(
        { error: { code: 'INVALID_CREDENTIALS' } },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = await this.authService.login(user);
    const userStatus = await this.userService.getUserStatus(
      user._id as Types.ObjectId,
    );
    return {
      access_token: token,
      userStatus,
    };
  }
}
