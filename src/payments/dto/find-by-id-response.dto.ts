import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../entities/payment.entity';

export class FindByIdResponseDto extends Payment {
  @ApiProperty()
  id: number;
}
