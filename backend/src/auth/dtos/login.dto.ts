import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class loginDto {
  @IsEmail({}, { message: 'please fill a valid email' })
  email!: string;

  @IsNotEmpty({ message: 'password is reguired' })
  @MinLength(6, { message: 'password must be as least 6 characters' })
  password!: string;
}
