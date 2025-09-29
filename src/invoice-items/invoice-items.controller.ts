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
  UseGuards,
} from '@nestjs/common';
import { InvoiceItemsService } from './invoice-items.service';
import { CreateInvoiceItemBodyDto } from './dto/create-invoice-item-body.dto';
import { CreateInvoiceItemResponseDto } from './dto/create-invoice-item-response.dto';
import { FindAllInvoiceItemsResponseDto } from './dto/find-all-invoice-items-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateInvoiceItemBodyDto } from './dto/update-invoice-item-body.dto';
import { PatchInvoiceItemBodyDto } from './dto/patch-invoice-item-body.dto';
import { UpdateInvoiceItemResponseDto } from './dto/update-invoice-item-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('invoice-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoice-items')
export class InvoiceItemsController {
  constructor(private readonly invoiceItemsService: InvoiceItemsService) {}

  @Post()
  @Roles('admin', 'accountant')
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
  @Roles('admin', 'accountant')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceItemDto: UpdateInvoiceItemBodyDto,
  ): Promise<UpdateInvoiceItemResponseDto> {
    return this.invoiceItemsService.update(id, updateInvoiceItemDto);
  }

  @Patch(':id')
  @Roles('admin', 'accountant')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchInvoiceItemDto: PatchInvoiceItemBodyDto,
  ): Promise<UpdateInvoiceItemResponseDto> {
    return this.invoiceItemsService.patch(id, patchInvoiceItemDto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.invoiceItemsService.delete(id);
  }
}
