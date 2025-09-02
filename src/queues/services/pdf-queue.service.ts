import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
  PdfGenerationJobData,
  PdfJobResult,
} from '../interfaces/job-data.interfaces';
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue-names';

@Injectable()
export class PdfQueueService {
  private readonly logger = new Logger(PdfQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.PDF_GENERATION)
    private pdfQueue: Queue,
  ) {}

  /**
   * Safely handle progress data from Bull queue
   */
  private sanitizeProgress(rawProgress: any): number | object {
    if (typeof rawProgress === 'number') {
      return Math.max(0, Math.min(100, rawProgress)); // Clamp between 0-100
    }
    if (typeof rawProgress === 'object' && rawProgress !== null) {
      return rawProgress as object; // Explicit cast after type check
    }
    return 0; // Default fallback
  }

  /**
   * Queue PDF generation for an invoice
   * API layer - only dispatches job, returns immediately
   */
  async generateInvoicePdf(
    invoiceId: number,
    requestedBy?: number,
    deliveryMethod: 'download' | 'email' = 'download',
    recipientEmail?: string,
  ): Promise<{ jobId: string; message: string }> {
    const jobData: PdfGenerationJobData = {
      invoiceId,
      requestedBy,
      deliveryMethod,
      recipientEmail,
    };

    // Dispatch job to background processor
    const job = await this.pdfQueue.add(
      JOB_NAMES.PDF_GENERATION.GENERATE_INVOICE_PDF,
      jobData,
      {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
        removeOnComplete: 20,
        removeOnFail: 10,
      },
    );

    this.logger.log(
      `PDF generation queued for invoice ${invoiceId}, job ID: ${job.id}`,
    );

    return {
      jobId: job.id.toString(),
      message: 'PDF generation started in background',
    };
  }

  /**
   * Get PDF generation job status
   */
  async getPdfJobStatus(jobId: string) {
    try {
      const job = await this.pdfQueue.getJob(jobId);
      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const result = job.returnvalue as PdfJobResult | undefined;

      const rawProgress: unknown = job.progress();
      const progress: number | object = this.sanitizeProgress(rawProgress);

      return {
        status: state,
        progress: typeof progress === 'number' ? progress : 0,
        data: job.data as PdfGenerationJobData,
        result: result,
        createdAt: new Date(job.timestamp),
        processedOn: job.processedOn ? new Date(job.processedOn) : null,
        finishedOn: job.finishedOn ? new Date(job.finishedOn) : null,
        failedReason: job.failedReason,
        downloadUrl: result?.downloadUrl || null,
      };
    } catch (error) {
      this.logger.error(`Failed to get PDF job status for ${jobId}:`, error);
      return {
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Cancel PDF generation job
   */
  async cancelPdfJob(jobId: string): Promise<boolean> {
    try {
      const job = await this.pdfQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Cancelled PDF generation job ${jobId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to cancel PDF job ${jobId}:`, error);
      return false;
    }
  }
}
