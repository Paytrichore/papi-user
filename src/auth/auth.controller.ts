import { BadRequestException, Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDTO } from 'src/user/dto/createUser.dto';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService, // Assurez-vous d'importer UserService
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
    if (existing) throw new BadRequestException('Cet email est déjà utilisé');
    const user = await this.userService.createUser(createUserDto);
    const token = await this.authService.login(user);
    return { access_token: token, user };
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const token = await this.authService.login(user);
    return {
      access_token: token,
      user,
    };
  }
}