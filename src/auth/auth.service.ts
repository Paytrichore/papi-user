import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserDocument } from 'src/user/user.model';
import * as bcrypt from 'bcrypt';

export interface OAuthLoginResult {
  access_token: string;
  user: UserDocument;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateOAuthLogin(
    email: string,
    username: string,
  ): Promise<OAuthLoginResult> {
    let user = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.createUser({
        email,
        username,
        password: '',
      });
    }
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  // Vérifie les credentials utilisateur
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
  }

  // Génère le JWT pour un utilisateur
  login(user: UserDocument): string {
    const payload = { email: user.email, sub: user._id };
    return this.jwtService.sign(payload);
  }
}
