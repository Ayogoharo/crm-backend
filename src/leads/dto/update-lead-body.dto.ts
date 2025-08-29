import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateLeadBodyDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  clientId?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  ownerId?: number;

  @ApiProperty({
    enum: ['new', 'contacted', 'qualified', 'won', 'lost'],
    required: false,
  })
  @IsEnum(['new', 'contacted', 'qualified', 'won', 'lost'])
  @IsOptional()
  status?: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
