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
  UseGuards,
} from '@nestjs/common';
import * as leadsService from './leads.service';
import { LeadsQueueService } from 'src/queues/services/leads-queue.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: leadsService.LeadsService,
    private readonly leadsQueueService: LeadsQueueService,
  ) {}

  @Post()
  @Roles('admin', 'sales')
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

  @Get(':id/enrichment')
  async enrichLead(@Param('id', ParseIntPipe) id: number) {
    // API layer - only dispatch jobs, no processing
    const lead = await this.leadsService.findById(id);

    if (!lead) {
      return { error: 'Lead not found' };
    }

    // Extract source data from lead
    const sourceData = {
      email: lead.notes?.includes('@')
        ? lead.notes.match(/\S+@\S+\.\S+/)?.[0]
        : undefined,
      company: lead.client?.name,
      phone: lead.client?.phone,
      website: lead.client?.address?.includes('http')
        ? lead.client.address
        : undefined,
    };

    // Single enrichment job
    const result = await this.leadsQueueService.enrichLead(id, sourceData);

    return {
      message: 'Lead enrichment started',
      jobId: result.jobId,
      statusUrl: `/leads/${id}/enrichment/status/${result.jobId}`,
    };
  }

  @Get(':id/enrichment/status/:jobId')
  async getEnrichmentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('jobId') jobId: string,
  ) {
    return this.leadsQueueService.getEnrichmentJobStatus(jobId);
  }

  @Put(':id')
  @Roles('admin', 'sales')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: leadsService.UpdateLeadBodyDto,
  ) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leadsService.delete(id);
  }
}
