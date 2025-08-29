import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class FilterInvoicesQueryDto {
  @ApiProperty({
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'active'],
    required: false,
    description:
      'Filter invoices by status. "overdue" returns invoices past due date, "active" returns invoices not yet due',
  })
  @IsString()
  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'active'])
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'active';
}
