import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateInvoiceItemBodyDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  invoiceId?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  lineTotal?: number;
}
