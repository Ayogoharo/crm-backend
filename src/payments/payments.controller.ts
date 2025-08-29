import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentBodyDto } from './dto/create-payment-body.dto';
import { CreatePaymentResponseDto } from './dto/create-payment-response.dto';
import { FindAllPaymentsResponseDto } from './dto/find-all-payments-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdatePaymentBodyDto } from './dto/update-payment-body.dto';
import { UpdatePaymentResponseDto } from './dto/update-payment-response.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentBodyDto,
  ): Promise<CreatePaymentResponseDto> {
    const payment = await this.paymentsService.create(createPaymentDto);
    return { id: payment.id };
  }

  @Get()
  async findAll(): Promise<FindAllPaymentsResponseDto> {
    const payments = await this.paymentsService.findAll();
    return { payments };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindByIdResponseDto> {
    return this.paymentsService.findById(id);
  }

  @Put()
  async update(
    @Body() updatePaymentDto: UpdatePaymentBodyDto,
  ): Promise<UpdatePaymentResponseDto> {
    return this.paymentsService.update(updatePaymentDto.id, updatePaymentDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentsService.delete(id);
  }
}
