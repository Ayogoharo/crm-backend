import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateUserBodyDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  passwordHash?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ enum: ['admin', 'sales', 'accountant'], required: false })
  @IsEnum(['admin', 'sales', 'accountant'])
  @IsOptional()
  role?: 'admin' | 'sales' | 'accountant';
}
