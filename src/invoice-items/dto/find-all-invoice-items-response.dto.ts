import { ApiProperty } from '@nestjs/swagger';
import { InvoiceItem } from '../entities/invoice-item.entity';

export class FindAllInvoiceItemsResponseDto {
  @ApiProperty({ type: [InvoiceItem] })
  invoiceItems: InvoiceItem[];
}
