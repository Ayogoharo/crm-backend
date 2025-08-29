import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../entities/payment.entity';

export class UpdatePaymentResponseDto extends Payment {
  @ApiProperty()
  id: number;
}
