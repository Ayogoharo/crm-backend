import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceBodyDto } from './dto/create-invoice-body.dto';
import { CreateInvoiceResponseDto } from './dto/create-invoice-response.dto';
import { FindAllInvoicesResponseDto } from './dto/find-all-invoices-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateInvoiceBodyDto } from './dto/update-invoice-body.dto';
import { UpdateInvoiceResponseDto } from './dto/update-invoice-response.dto';
import { FilterInvoicesQueryDto } from './dto/filter-invoices-query.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(
    @Body() createInvoiceDto: CreateInvoiceBodyDto,
  ): Promise<CreateInvoiceResponseDto> {
    const invoice = await this.invoicesService.create(createInvoiceDto);
    return { id: invoice.id };
  }

  @Get()
  async findAll(
    @Query() filters: FilterInvoicesQueryDto,
  ): Promise<FindAllInvoicesResponseDto> {
    // If no filters are provided, return all invoices
    if (!filters.status) {
      return this.invoicesService.findAll();
    }
    // Otherwise, use the filtered search
    return this.invoicesService.findByFilters(filters);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindByIdResponseDto> {
    return this.invoicesService.findById(id);
  }

  @Put()
  async update(
    @Body() updateInvoiceDto: UpdateInvoiceBodyDto,
  ): Promise<UpdateInvoiceResponseDto> {
    return this.invoicesService.update(updateInvoiceDto.id, updateInvoiceDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.invoicesService.delete(id);
  }
}
