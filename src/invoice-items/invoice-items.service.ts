import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InvoiceItemsService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async create(invoiceItemData: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const invoiceItem = this.invoiceItemRepository.create(invoiceItemData);
    return this.invoiceItemRepository.save(invoiceItem);
  }

  async findAll(): Promise<InvoiceItem[]> {
    try {
      return this.invoiceItemRepository.find({
        relations: ['invoice'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding invoice items: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<InvoiceItem> {
    try {
      const invoiceItem = await this.invoiceItemRepository.findOne({
        where: { id },
        relations: ['invoice'],
      });
      if (!invoiceItem || invoiceItem === null) {
        throw new NotFoundException(`Invoice item with ID ${id} not found`);
      }
      return invoiceItem;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding invoice item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(
    id: number,
    invoiceItemData: Partial<InvoiceItem>,
  ): Promise<InvoiceItem> {
    await this.findById(id); // Check if invoice item exists
    await this.invoiceItemRepository.update(id, invoiceItemData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const invoiceItem = await this.findById(id); // Check if invoice item exists
    await this.invoiceItemRepository.remove(invoiceItem);
  }
}
