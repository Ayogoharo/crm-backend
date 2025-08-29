import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateUserBodyDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: ['admin', 'sales', 'accountant'] })
  @IsEnum(['admin', 'sales', 'accountant'])
  @IsNotEmpty()
  role: 'admin' | 'sales' | 'accountant';
}
