import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsEnum, IsString } from 'class-validator';

export class UpdatePaymentBodyDto {
  @ApiProperty()
  @IsNumber()
  invoiceId: number;

  @ApiProperty()
  @IsNumber()
  recordedBy: number;

  @ApiProperty()
  @IsDateString()
  paymentDate: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    enum: ['cash', 'bank_transfer', 'credit_card', 'paypal'],
  })
  @IsEnum(['cash', 'bank_transfer', 'credit_card', 'paypal'])
  method: 'cash' | 'bank_transfer' | 'credit_card' | 'paypal';

  @ApiProperty()
  @IsString()
  reference: string;
}
