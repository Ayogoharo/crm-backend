import { ApiProperty } from '@nestjs/swagger';

export class UpdateInvoiceItemResponseDto {
  @ApiProperty()
  id: number;
}
