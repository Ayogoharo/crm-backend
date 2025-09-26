import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';

export class PatchInvoiceBodyDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  clientId?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  issuedBy?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  invoiceDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    required: false,
  })
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  @IsOptional()
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;
}
