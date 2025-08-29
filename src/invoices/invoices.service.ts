import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInvoiceBodyDto } from './dto/create-invoice-body.dto';
import { CreateInvoiceResponseDto } from './dto/create-invoice-response.dto';
import { FindAllInvoicesResponseDto } from './dto/find-all-invoices-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateInvoiceBodyDto } from './dto/update-invoice-body.dto';
import { UpdateInvoiceResponseDto } from './dto/update-invoice-response.dto';
import { FilterInvoicesQueryDto } from './dto/filter-invoices-query.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(
    invoiceData: CreateInvoiceBodyDto,
  ): Promise<CreateInvoiceResponseDto> {
    try {
      const invoice = this.invoiceRepository.create(invoiceData);
      const newInvoice = await this.invoiceRepository.save(invoice);
      return { id: newInvoice.id };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(): Promise<FindAllInvoicesResponseDto> {
    try {
      const invoices = await this.invoiceRepository.find({
        relations: ['client', 'issuedByUser', 'invoiceItems', 'payments'],
      });
      return { invoices };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding invoices: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<FindByIdResponseDto> {
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

  async update(
    id: number,
    invoice: UpdateInvoiceBodyDto,
  ): Promise<UpdateInvoiceResponseDto> {
    try {
      const existingInvoice = await this.invoiceRepository.findOneBy({
        id: invoice.id,
      });
      if (!existingInvoice || existingInvoice === null) {
        throw new NotFoundException(`Invoice with ID ${invoice.id} not found`);
      }
      await this.invoiceRepository.update(invoice.id, invoice);
      return this.findById(invoice.id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findByFilters(
    filters: FilterInvoicesQueryDto,
  ): Promise<FindAllInvoicesResponseDto> {
    try {
      const queryBuilder = this.invoiceRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.client', 'client')
        .leftJoinAndSelect('invoice.issuedByUser', 'issuedByUser')
        .leftJoinAndSelect('invoice.invoiceItems', 'invoiceItems')
        .leftJoinAndSelect('invoice.payments', 'payments');

      if (filters.status) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

        if (filters.status === 'overdue') {
          // Return invoices where dueDate is before current date
          queryBuilder.where('invoice.dueDate < :currentDate', { currentDate });
        } else if (filters.status === 'active') {
          // Return invoices where dueDate is today or in the future
          queryBuilder.where('invoice.dueDate >= :currentDate', {
            currentDate,
          });
        } else {
          // Handle regular status filtering (draft, sent, paid, cancelled)
          queryBuilder.where('invoice.status = :status', {
            status: filters.status,
          });
        }
      }

      const invoices = await queryBuilder.getMany();
      return { invoices };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error filtering invoices: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existingInvoice = await this.invoiceRepository.findOneBy({ id });
      if (!existingInvoice || existingInvoice === null) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }
      await this.invoiceRepository.remove(existingInvoice);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
