import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceItemResponseDto {
  @ApiProperty()
  id: number;
}
