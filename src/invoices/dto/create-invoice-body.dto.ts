import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateInvoiceBodyDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  issuedBy: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  invoiceDate: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] })
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  @IsNotEmpty()
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;
}
