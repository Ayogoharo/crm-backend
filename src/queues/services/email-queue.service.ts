import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { EmailReminderJobData } from '../interfaces/job-data.interfaces';
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue-names';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL_REMINDERS)
    private emailQueue: Queue,
  ) {}

  /**
   * Schedule an invoice reminder email to be sent 2 days before due date
   * API layer - only dispatches job, no processing
   */
  async scheduleInvoiceReminder(
    invoiceId: number,
    clientEmail: string,
    clientName: string,
    dueDate: Date,
    totalAmount: number,
    invoiceNumber?: string,
  ): Promise<{ jobId: string; scheduledFor: Date }> {
    // Calculate delay: send 2 days before due date
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 2);

    const now = new Date();
    const delay = Math.max(0, reminderDate.getTime() - now.getTime());

    const jobData: EmailReminderJobData = {
      invoiceId,
      clientEmail,
      clientName,
      dueDate,
      totalAmount,
      invoiceNumber,
    };

    // Dispatch job to background processor
    const job = await this.emailQueue.add(
      JOB_NAMES.EMAIL_REMINDERS.SEND_INVOICE_REMINDER,
      jobData,
      {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    );

    this.logger.log(
      `Invoice reminder scheduled for invoice ${invoiceId}, job ID: ${job.id}`,
    );
    this.logger.log(`Reminder will be sent at: ${reminderDate.toISOString()}`);

    return {
      jobId: job.id.toString(),
      scheduledFor: reminderDate,
    };
  }

  /**
   * Cancel a scheduled invoice reminder
   */
  async cancelInvoiceReminder(jobId: string): Promise<boolean> {
    try {
      const job = await this.emailQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Cancelled invoice reminder job ${jobId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to cancel job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<{
    status: string;
    progress?: number;
    progressData?: Record<string, unknown>;
    data?: EmailReminderJobData;
    createdAt?: Date;
    processedOn?: Date | null;
    finishedOn?: Date | null;
    failedReason?: string;
    error?: string;
  }> {
    try {
      const job = await this.emailQueue.getJob(jobId);
      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const rawProgress: unknown = job.progress();

      // Safely handle progress data
      let progress: number | undefined;
      let progressData: Record<string, unknown> | undefined;

      if (typeof rawProgress === 'number') {
        progress = rawProgress;
      } else if (rawProgress && typeof rawProgress === 'object') {
        progressData = rawProgress as Record<string, unknown>;
        // If object has a numeric progress property, extract it
        if (
          'progress' in rawProgress &&
          typeof rawProgress.progress === 'number'
        ) {
          progress = rawProgress.progress;
        }
      }

      return {
        status: state,
        ...(progress !== undefined && { progress }),
        ...(progressData !== undefined && { progressData }),
        data: job.data as EmailReminderJobData,
        createdAt: new Date(job.timestamp),
        processedOn: job.processedOn ? new Date(job.processedOn) : null,
        finishedOn: job.finishedOn ? new Date(job.finishedOn) : null,
        failedReason: job.failedReason,
      };
    } catch (error) {
      this.logger.error(`Failed to get job status for ${jobId}:`, error);
      return {
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
