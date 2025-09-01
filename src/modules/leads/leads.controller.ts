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
import * as leadsService from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: leadsService.LeadsService) {}

  @Post()
  async create(
    @Body() createLeadDto: leadsService.CreateLeadBodyDto,
  ): Promise<leadsService.CreateLeadResponseDto> {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  async findAll(
    @Query() filters: leadsService.FilterLeadsQueryDto,
  ): Promise<leadsService.FindAllLeadsResponseDto> {
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
    @Body() updateLeadDto: leadsService.UpdateLeadBodyDto,
  ) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leadsService.delete(id);
  }
}
