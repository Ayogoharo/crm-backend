import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../entities/payment.entity';

export class FindAllPaymentsResponseDto {
  @ApiProperty({ type: [Payment] })
  payments: Payment[];
}
