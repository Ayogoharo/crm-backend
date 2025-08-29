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
import { InvoiceItemsService } from './invoice-items.service';
import { CreateInvoiceItemBodyDto } from './dto/create-invoice-item-body.dto';
import { CreateInvoiceItemResponseDto } from './dto/create-invoice-item-response.dto';
import { FindAllInvoiceItemsResponseDto } from './dto/find-all-invoice-items-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateInvoiceItemBodyDto } from './dto/update-invoice-item-body.dto';
import { UpdateInvoiceItemResponseDto } from './dto/update-invoice-item-response.dto';

@Controller('invoice-items')
export class InvoiceItemsController {
  constructor(private readonly invoiceItemsService: InvoiceItemsService) {}

  @Post()
  async create(
    @Body() createInvoiceItemDto: CreateInvoiceItemBodyDto,
  ): Promise<CreateInvoiceItemResponseDto> {
    const invoiceItem =
      await this.invoiceItemsService.create(createInvoiceItemDto);
    return { id: invoiceItem.id };
  }

  @Get()
  async findAll(): Promise<FindAllInvoiceItemsResponseDto> {
    return this.invoiceItemsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindByIdResponseDto> {
    return this.invoiceItemsService.findById(id);
  }

  @Put()
  async update(
    @Body() updateInvoiceItemDto: UpdateInvoiceItemBodyDto,
  ): Promise<UpdateInvoiceItemResponseDto> {
    return this.invoiceItemsService.update(
      updateInvoiceItemDto.id,
      updateInvoiceItemDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.invoiceItemsService.delete(id);
  }
}
