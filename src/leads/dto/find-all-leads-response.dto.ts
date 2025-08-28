import { ApiProperty } from '@nestjs/swagger';

export class LeadResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  clientId: number;

  @ApiProperty()
  ownerId: number;

  @ApiProperty({ enum: ['new', 'contacted', 'qualified', 'won', 'lost'] })
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

  @ApiProperty()
  source: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FindAllLeadsResponseDto {
  @ApiProperty({ type: [LeadResponseDto] })
  leads: LeadResponseDto[];
}
