import {
  Body,
  Controller,
  Get,
  Header,
  MessageEvent,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { UserEntity } from './user.model';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserRealtimeService } from './user-realtime.service';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface JwtRequest extends Request {
  user: JwtPayload;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userRealtimeService: UserRealtimeService,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDTO): Promise<UserEntity> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Req() req: JwtRequest) {
    return this.userService.getUserStatus(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('use-points')
  async useActionPoints(
    @Req() req: JwtRequest,
    @Body('points') points: number,
  ) {
    return this.userService.useActionPoints(req.user.userId, points);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('draft')
  async makeDraft(@Req() req: JwtRequest) {
    return this.userService.makeDraft(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('status')
  async getStatus(@Req() req: JwtRequest) {
    return this.userService.getUserStatus(req.user.userId);
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    return this.userService.getPublicProfile(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('events')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  events(@Req() req: JwtRequest): Observable<MessageEvent> {
    return this.userRealtimeService.subscribe(req.user.userId);
  }
}
