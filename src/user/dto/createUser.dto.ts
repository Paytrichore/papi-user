import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @MinLength(6)
  readonly password: string;
}