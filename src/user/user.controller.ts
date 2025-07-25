import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { UserEntity } from './user.model';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface JwtRequest extends Request {
  user: JwtPayload;
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDTO): Promise<UserEntity> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Req() req: JwtRequest) {
    return this.userService.getUserStatus(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('use-points')
  async useActionPoints(
    @Req() req: JwtRequest,
    @Body('points') points: number,
  ) {
    return this.userService.useActionPoints(req.user.sub, points);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('draft')
  async makeDraft(@Req() req: JwtRequest) {
    return this.userService.makeDraft(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('status')
  async getStatus(@Req() req: JwtRequest) {
    return this.userService.getUserStatus(req.user.sub);
  }
}
