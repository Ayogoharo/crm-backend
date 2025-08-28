import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentRepository.create(paymentData);
    return this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    try {
      return this.paymentRepository.find({
        relations: ['invoice', 'recordedByUser'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding payments: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<Payment> {
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
      throw new InternalServerErrorException(
        `Error finding payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(id: number, paymentData: Partial<Payment>): Promise<Payment> {
    await this.findById(id); // Check if payment exists
    await this.paymentRepository.update(id, paymentData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const payment = await this.findById(id); // Check if payment exists
    await this.paymentRepository.remove(payment);
  }
}
