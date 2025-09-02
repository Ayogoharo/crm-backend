import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import bull from 'bull';
import {
  LeadsEnrichmentJobData,
  EnrichmentJobResult,
} from '../interfaces/job-data.interfaces';
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue-names';

@Injectable()
export class LeadsQueueService {
  private readonly logger = new Logger(LeadsQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.LEADS_ENRICHMENT)
    private leadsQueue: bull.Queue,
  ) {}

  /**
   * Queue lead enrichment job
   * API layer - only dispatches job, no processing
   */
  async enrichLead(
    leadId: number,
    sourceData: {
      email?: string;
      company?: string;
      phone?: string;
      website?: string;
    },
  ): Promise<{ jobId: string; message: string }> {
    const jobData: LeadsEnrichmentJobData = {
      leadId,
      sourceData,
    };

    // Dispatch job to background processor
    const job = await this.leadsQueue.add(
      JOB_NAMES.LEADS_ENRICHMENT.ENRICH_LEAD_DATA,
      jobData,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: 15,
        removeOnFail: 8,
      },
    );

    this.logger.log(
      `Lead enrichment queued for lead ${leadId}, job ID: ${job.id}`,
    );

    return {
      jobId: job.id.toString(),
      message: 'Lead enrichment started in background',
    };
  }

  /**
   * Get enrichment job status
   */
  async getEnrichmentJobStatus(jobId: string) {
    try {
      const job = await this.leadsQueue.getJob(jobId);
      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const result = job.returnvalue as EnrichmentJobResult | undefined;

      // Safely handle job progress which can be number, object, or undefined
      const jobProgress: unknown = job.progress();
      const progress: number =
        typeof jobProgress === 'number'
          ? jobProgress
          : typeof jobProgress === 'object' &&
              jobProgress &&
              'percent' in jobProgress
            ? (jobProgress as { percent: number }).percent
            : 0;

      return {
        status: state,
        progress,
        data: job.data as LeadsEnrichmentJobData,
        result: result,
        createdAt: new Date(job.timestamp),
        processedOn: job.processedOn ? new Date(job.processedOn) : null,
        finishedOn: job.finishedOn ? new Date(job.finishedOn) : null,
        failedReason: job.failedReason,
        enrichedData: result?.enrichedData || null,
        confidence: result?.confidence || null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get enrichment job status for ${jobId}:`,
        error,
      );
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { status: 'error', error: errorMessage };
    }
  }

  /**
   * Cancel enrichment job
   */
  async cancelEnrichmentJob(jobId: string): Promise<boolean> {
    try {
      const job = await this.leadsQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Cancelled enrichment job ${jobId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to cancel enrichment job ${jobId}:`, error);
      return false;
    }
  }
}
