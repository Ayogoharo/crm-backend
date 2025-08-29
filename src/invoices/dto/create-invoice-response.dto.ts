import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceResponseDto {
  @ApiProperty()
  id: number;
}
