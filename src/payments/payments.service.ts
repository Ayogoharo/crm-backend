import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentBodyDto } from './dto/create-payment-body.dto';
import { CreatePaymentResponseDto } from './dto/create-payment-response.dto';
import { FindAllPaymentsResponseDto } from './dto/find-all-payments-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdatePaymentBodyDto } from './dto/update-payment-body.dto';
import { UpdatePaymentResponseDto } from './dto/update-payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(
    paymentData: CreatePaymentBodyDto,
  ): Promise<CreatePaymentResponseDto> {
    try {
      const payment = this.paymentRepository.create(paymentData);
      const newPayment = await this.paymentRepository.save(payment);
      return { id: newPayment.id };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(): Promise<FindAllPaymentsResponseDto> {
    try {
      const payments = await this.paymentRepository.find({
        relations: ['invoice', 'recordedByUser'],
      });
      return { payments };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding payments: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<FindByIdResponseDto> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id },
        relations: ['invoice', 'recordedByUser'],
      });
      if (!payment || payment === null) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(
    id: number,
    payment: UpdatePaymentBodyDto,
  ): Promise<UpdatePaymentResponseDto> {
    try {
      const existingPayment = await this.paymentRepository.findOneBy({
        id: payment.id,
      });
      if (!existingPayment || existingPayment === null) {
        throw new NotFoundException(`Payment with ID ${payment.id} not found`);
      }
      await this.paymentRepository.update(payment.id, payment);
      return this.findById(payment.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error updating payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existingPayment = await this.paymentRepository.findOneBy({ id });
      if (!existingPayment || existingPayment === null) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      await this.paymentRepository.remove(existingPayment);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error deleting payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
