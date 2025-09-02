import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentResponseDto {
  @ApiProperty()
  id: number;
}
