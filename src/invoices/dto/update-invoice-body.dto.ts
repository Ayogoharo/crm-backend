import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsEnum } from 'class-validator';

export class UpdateInvoiceBodyDto {
  @ApiProperty()
  @IsNumber()
  clientId: number;

  @ApiProperty()
  @IsNumber()
  issuedBy: number;

  @ApiProperty()
  @IsDateString()
  invoiceDate: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
  })
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  @ApiProperty()
  @IsNumber()
  totalAmount: number;
}
