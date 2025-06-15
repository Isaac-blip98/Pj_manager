import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class RegisterDto {
  @IsEmail({}, { message: 'please provide a valid email adress' })
  email!: string;

  @IsNotEmpty({ message: 'password is required' })
  @MinLength(6, { message: 'password must be 6 characters long' })
  password!: string;

  @IsNotEmpty({ message: 'name is required' })
  @IsNotEmpty({ message: 'name is required' })
  name!: string;
}
