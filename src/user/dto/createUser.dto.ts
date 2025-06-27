import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  readonly username: string;

  @IsEmail()
  readonly email: string;

  @MinLength(6)
  readonly password: string;
}