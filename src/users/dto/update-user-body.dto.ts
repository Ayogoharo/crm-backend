import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';

export class UpdateUserBodyDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty({ enum: ['admin', 'sales', 'accountant'] })
  @IsEnum(['admin', 'sales', 'accountant'])
  role: 'admin' | 'sales' | 'accountant';
}
