import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';

export class PatchPaymentBodyDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  invoiceId?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  recordedBy?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    enum: ['cash', 'bank_transfer', 'credit_card', 'paypal'],
    required: false,
  })
  @IsEnum(['cash', 'bank_transfer', 'credit_card', 'paypal'])
  @IsOptional()
  method?: 'cash' | 'bank_transfer' | 'credit_card' | 'paypal';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reference?: string;
}
