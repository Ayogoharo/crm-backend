import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { PatchPaymentBodyDto } from './dto/patch-payment-body.dto';
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
    return this.paymentsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindByIdResponseDto> {
    return this.paymentsService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentBodyDto,
  ): Promise<UpdatePaymentResponseDto> {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchPaymentDto: PatchPaymentBodyDto,
  ): Promise<UpdatePaymentResponseDto> {
    return this.paymentsService.patch(id, patchPaymentDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentsService.delete(id);
  }
}
