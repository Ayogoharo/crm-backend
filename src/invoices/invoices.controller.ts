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
  Query,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PdfQueueService } from 'src/queues/services/pdf-queue.service';
import { CreateInvoiceBodyDto } from './dto/create-invoice-body.dto';
import { CreateInvoiceResponseDto } from './dto/create-invoice-response.dto';
import { FindAllInvoicesResponseDto } from './dto/find-all-invoices-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateInvoiceBodyDto } from './dto/update-invoice-body.dto';
import { PatchInvoiceBodyDto } from './dto/patch-invoice-body.dto';
import { UpdateInvoiceResponseDto } from './dto/update-invoice-response.dto';
import { FilterInvoicesQueryDto } from './dto/filter-invoices-query.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfQueueService: PdfQueueService,
  ) {}

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

  @Get(':id/pdf')
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Query('requestedBy') requestedBy?: number,
  ) {
    // API layer - only dispatch job, no processing
    const result = await this.pdfQueueService.generateInvoicePdf(
      id,
      requestedBy,
      'download',
    );

    return {
      message: 'PDF generation started',
      jobId: result.jobId,
      statusUrl: `/invoices/${id}/pdf/status/${result.jobId}`,
    };
  }

  @Get(':id/pdf/status/:jobId')
  async getPdfStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('jobId') jobId: string,
  ) {
    return this.pdfQueueService.getPdfJobStatus(jobId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceDto: UpdateInvoiceBodyDto,
  ): Promise<UpdateInvoiceResponseDto> {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchInvoiceDto: PatchInvoiceBodyDto,
  ): Promise<UpdateInvoiceResponseDto> {
    return this.invoicesService.patch(id, patchInvoiceDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.invoicesService.delete(id);
  }
}
