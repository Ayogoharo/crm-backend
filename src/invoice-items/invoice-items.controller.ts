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
import { InvoiceItemsService } from './invoice-items.service';
import { CreateInvoiceItemBodyDto } from './dto/create-invoice-item-body.dto';
import { CreateInvoiceItemResponseDto } from './dto/create-invoice-item-response.dto';
import { FindAllInvoiceItemsResponseDto } from './dto/find-all-invoice-items-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateInvoiceItemBodyDto } from './dto/update-invoice-item-body.dto';
import { PatchInvoiceItemBodyDto } from './dto/patch-invoice-item-body.dto';
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

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceItemDto: UpdateInvoiceItemBodyDto,
  ): Promise<UpdateInvoiceItemResponseDto> {
    return this.invoiceItemsService.update(id, updateInvoiceItemDto);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchInvoiceItemDto: PatchInvoiceItemBodyDto,
  ): Promise<UpdateInvoiceItemResponseDto> {
    return this.invoiceItemsService.patch(id, patchInvoiceItemDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.invoiceItemsService.delete(id);
  }
}
