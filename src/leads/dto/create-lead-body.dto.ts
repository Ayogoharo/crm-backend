import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateLeadBodyDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @ApiProperty({ enum: ['new', 'contacted', 'qualified', 'won', 'lost'] })
  @IsEnum(['new', 'contacted', 'qualified', 'won', 'lost'])
  @IsNotEmpty()
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
