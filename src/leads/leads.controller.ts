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
import { LeadsService } from './leads.service';
import { CreateLeadBodyDto } from './dto/create-lead-body.dto';
import { UpdateLeadBodyDto } from './dto/update-lead-body.dto';
import { CreateLeadResponseDto } from './dto/create-lead-response.dto';
import { FindAllLeadsResponseDto } from './dto/find-all-leads-response.dto';
import { FilterLeadsQueryDto } from './dto/filter-leads-query.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(
    @Body() createLeadDto: CreateLeadBodyDto,
  ): Promise<CreateLeadResponseDto> {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  async findAll(
    @Query() filters: FilterLeadsQueryDto,
  ): Promise<FindAllLeadsResponseDto> {
    // If no filters are provided, return all leads
    if (!filters.userId && !filters.status) {
      return this.leadsService.findAll();
    }
    // Otherwise, use the filtered search
    return this.leadsService.findByFilters(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: UpdateLeadBodyDto,
  ) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leadsService.delete(id);
  }
}
