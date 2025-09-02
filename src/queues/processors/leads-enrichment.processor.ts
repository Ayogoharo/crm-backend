import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import bull from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LeadsEnrichmentJobData,
  EnrichmentJobResult,
} from '../interfaces/job-data.interfaces';
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue-names';
import { Lead } from 'src/modules/leads/domain/entities/lead.entity';

@Processor(QUEUE_NAMES.LEADS_ENRICHMENT)
@Injectable()
export class LeadsEnrichmentProcessor {
  private readonly logger = new Logger(LeadsEnrichmentProcessor.name);

  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) {}

  @Process(JOB_NAMES.LEADS_ENRICHMENT.ENRICH_LEAD_DATA)
  async handleLeadsEnrichment(
    job: bull.Job<LeadsEnrichmentJobData>,
  ): Promise<EnrichmentJobResult> {
    const { leadId, sourceData } = job.data;

    this.logger.log(`Processing lead enrichment for lead ${leadId}`);

    try {
      // Verify lead still exists
      const lead = await this.leadRepository.findOne({
        where: { id: leadId },
        relations: ['client'],
      });

      if (!lead) {
        this.logger.warn(`Lead ${leadId} not found, skipping enrichment`);
        return {
          success: false,
          message: 'Lead not found',
          error: 'Lead may have been deleted',
        };
      }

      // Console log for now - API implementation will be added later
      console.log('=== LEAD ENRICHMENT JOB PROCESSED ===');
      console.log(`Lead ID: ${leadId}`);
      console.log(`Source Data:`, sourceData);
      console.log(`Lead Info:`, {
        id: lead.id,
        status: lead.status,
        source: lead.source,
        notes: lead.notes,
        clientName: lead.client?.name,
        clientEmail: lead.client?.email,
      });
      console.log('=== API CALL WOULD HAPPEN HERE ===');

      // Simulate API processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.log(`Lead enrichment job completed for lead ${leadId}`);

      return {
        success: true,
        message: 'Lead enrichment job processed successfully',
        data: {
          leadId,
          processedAt: new Date().toISOString(),
          sourceData,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to process enrichment job for lead ${leadId}:`,
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: 'Failed to process lead enrichment job',
        error: errorMessage,
      };
    }
  }
}
