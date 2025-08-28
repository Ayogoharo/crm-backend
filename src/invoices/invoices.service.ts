import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const invoice = this.invoiceRepository.create(invoiceData);
    return this.invoiceRepository.save(invoice);
  }

  async findAll(): Promise<Invoice[]> {
    try {
      return this.invoiceRepository.find({
        relations: ['client', 'issuedByUser', 'invoiceItems', 'payments'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding invoices: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<Invoice> {
    try {
      const invoice = await this.invoiceRepository.findOne({
        where: { id },
        relations: ['client', 'issuedByUser', 'invoiceItems', 'payments'],
      });
      if (!invoice || invoice === null) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }
      return invoice;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(id: number, invoiceData: Partial<Invoice>): Promise<Invoice> {
    await this.findById(id); // Check if invoice exists
    await this.invoiceRepository.update(id, invoiceData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const invoice = await this.findById(id); // Check if invoice exists
    await this.invoiceRepository.remove(invoice);
  }
}
