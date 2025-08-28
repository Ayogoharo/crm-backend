import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateLeadDto {
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
