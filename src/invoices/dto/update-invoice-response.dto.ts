import { ApiProperty } from '@nestjs/swagger';

export class UpdateInvoiceResponseDto {
  @ApiProperty()
  id: number;
}
