import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from '../entities/invoice.entity';

export class FindAllInvoicesResponseDto {
  @ApiProperty({ type: [Invoice] })
  invoices: Invoice[];
}
