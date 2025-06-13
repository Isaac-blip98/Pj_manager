import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from "@prisma/client";

export class CreateUserDto{
 @IsString({message: 'Name must be a string'})
 @IsNotEmpty({message: 'Name is required'})
 @MinLength(2, {message: 'Name must be atleast 2 characters'})
 @MaxLength(50, {message: 'Name must be atmost 50 characters'})
 name: string = '';

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string = '';

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string = '';

  @IsOptional()
  @IsEnum(UserRole,  {message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,})
  roleId?: UserRole;

}
