import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreatePaymentBodyDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  invoiceId: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  recordedBy?: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: ['cash', 'bank_transfer', 'credit_card', 'paypal'] })
  @IsEnum(['cash', 'bank_transfer', 'credit_card', 'paypal'])
  @IsNotEmpty()
  method: 'cash' | 'bank_transfer' | 'credit_card' | 'paypal';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reference?: string;
}
