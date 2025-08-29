import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInvoiceItemBodyDto } from './dto/create-invoice-item-body.dto';
import { CreateInvoiceItemResponseDto } from './dto/create-invoice-item-response.dto';
import { FindAllInvoiceItemsResponseDto } from './dto/find-all-invoice-items-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateInvoiceItemBodyDto } from './dto/update-invoice-item-body.dto';
import { UpdateInvoiceItemResponseDto } from './dto/update-invoice-item-response.dto';

@Injectable()
export class InvoiceItemsService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async create(
    invoiceItemData: CreateInvoiceItemBodyDto,
  ): Promise<CreateInvoiceItemResponseDto> {
    try {
      const invoiceItem = this.invoiceItemRepository.create(invoiceItemData);
      const newInvoiceItem = await this.invoiceItemRepository.save(invoiceItem);
      return { id: newInvoiceItem.id };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating invoice item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(): Promise<FindAllInvoiceItemsResponseDto> {
    try {
      const invoiceItems = await this.invoiceItemRepository.find({
        relations: ['invoice'],
      });
      return { invoiceItems };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding invoice items: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<FindByIdResponseDto> {
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
    invoiceItem: UpdateInvoiceItemBodyDto,
  ): Promise<UpdateInvoiceItemResponseDto> {
    try {
      const existingInvoiceItem = await this.invoiceItemRepository.findOneBy({
        id: invoiceItem.id,
      });
      if (!existingInvoiceItem || existingInvoiceItem === null) {
        throw new NotFoundException(
          `Invoice item with ID ${invoiceItem.id} not found`,
        );
      }
      await this.invoiceItemRepository.update(invoiceItem.id, invoiceItem);
      return this.findById(invoiceItem.id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating invoice item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existingInvoiceItem = await this.invoiceItemRepository.findOneBy({
        id,
      });
      if (!existingInvoiceItem || existingInvoiceItem === null) {
        throw new NotFoundException(`Invoice item with ID ${id} not found`);
      }
      await this.invoiceItemRepository.remove(existingInvoiceItem);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting invoice item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
