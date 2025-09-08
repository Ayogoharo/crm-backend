import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { EmailReminderJobData } from '../queues/interfaces/job-data.interfaces';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/constants/queue-names';
import { MailService, EmailJobData } from './mail.service';

export interface JobStatusResponse {
  status: string;
  progress?: number;
  progressData?: Record<string, unknown>;
  data?: EmailReminderJobData | EmailJobData;
  createdAt?: Date;
  processedOn?: Date | null;
  finishedOn?: Date | null;
  failedReason?: string;
  error?: string;
  scheduledFor?: Date;
}

@Injectable()
export class EnhancedEmailQueueService {
  private readonly logger = new Logger(EnhancedEmailQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL_REMINDERS)
    private emailQueue: Queue,
    private readonly mailService: MailService,
  ) {}

  /**
   * Schedule an invoice reminder email to be sent X days before due date
   */
  async scheduleInvoiceReminder(
    invoiceId: number,
    clientEmail: string,
    clientName: string,
    dueDate: Date,
    totalAmount: number,
    invoiceNumber?: string,
    daysBefore: number = 2,
  ): Promise<{ jobId: string; scheduledFor: Date }> {
    // Calculate delay: send X days before due date
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);

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
   * Update existing invoice reminder (cancel old, schedule new)
   */
  async updateInvoiceReminder(
    existingJobId: string,
    invoiceId: number,
    clientEmail: string,
    clientName: string,
    dueDate: Date,
    totalAmount: number,
    invoiceNumber?: string,
    daysBefore: number = 2,
  ): Promise<{ jobId: string; scheduledFor: Date; updated: boolean }> {
    // Cancel existing job
    const cancelled = await this.cancelInvoiceReminder(existingJobId);
    if (cancelled) {
      this.logger.log(
        `Cancelled existing job ${existingJobId} for invoice ${invoiceId}`,
      );
    }

    // Schedule new job
    const result = await this.scheduleInvoiceReminder(
      invoiceId,
      clientEmail,
      clientName,
      dueDate,
      totalAmount,
      invoiceNumber,
      daysBefore,
    );

    return {
      ...result,
      updated: cancelled,
    };
  }

  /**
   * Schedule a custom email job with flexible options
   */
  async scheduleCustomEmail(
    emailData: EmailJobData,
    delay: number = 0,
  ): Promise<{ jobId: string; scheduledFor: Date }> {
    const scheduledFor = new Date(Date.now() + delay);

    const job = await this.emailQueue.add('send-custom-email', emailData, {
      delay,
      attempts: emailData.attempts || 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
      priority: this.getPriorityValue(emailData.priority),
    });

    this.logger.log(`Custom email scheduled, job ID: ${job.id}`);
    this.logger.log(`Email will be sent at: ${scheduledFor.toISOString()}`);

    return {
      jobId: job.id.toString(),
      scheduledFor,
    };
  }

  /**
   * Send immediate email (bypasses queue)
   */
  async sendImmediateEmail(
    to: string | string[],
    subject: string,
    content: { text?: string; html?: string },
    from?: string,
  ): Promise<boolean> {
    return await this.mailService.sendEmail({
      to,
      subject,
      text: content.text,
      html: content.html,
      from,
    });
  }

  /**
   * Cancel any email job
   */
  async cancelInvoiceReminder(jobId: string): Promise<boolean> {
    try {
      const job = await this.emailQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Cancelled email job ${jobId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to cancel job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Get comprehensive job status
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    try {
      const job = await this.emailQueue.getJob(jobId);
      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const rawProgress: unknown = job.progress();

      let progress: number | undefined;
      let progressData: Record<string, unknown> | undefined;

      if (typeof rawProgress === 'number') {
        progress = rawProgress;
      } else if (rawProgress && typeof rawProgress === 'object') {
        progressData = rawProgress as Record<string, unknown>;
        if (
          'progress' in rawProgress &&
          typeof rawProgress.progress === 'number'
        ) {
          progress = rawProgress.progress;
        }
      }

      // Calculate scheduled time if job has delay
      let scheduledFor: Date | undefined;
      if (job.opts.delay && job.timestamp) {
        scheduledFor = new Date(job.timestamp + job.opts.delay);
      }

      return {
        status: state,
        ...(progress !== undefined && { progress }),
        ...(progressData !== undefined && { progressData }),
        data: job.data as EmailReminderJobData | EmailJobData,
        createdAt: new Date(job.timestamp),
        processedOn: job.processedOn ? new Date(job.processedOn) : null,
        finishedOn: job.finishedOn ? new Date(job.finishedOn) : null,
        failedReason: job.failedReason,
        ...(scheduledFor && { scheduledFor }),
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

  /**
   * Get all pending jobs for a specific invoice
   */
  async getInvoiceJobs(invoiceId: number): Promise<
    Array<{
      jobId: string;
      status: string;
      scheduledFor?: Date;
      data: EmailReminderJobData;
    }>
  > {
    try {
      const jobs = await this.emailQueue.getJobs([
        'waiting',
        'delayed',
        'active',
      ]);

      const invoiceJobs = jobs
        .filter(
          (job) =>
            job.name === JOB_NAMES.EMAIL_REMINDERS.SEND_INVOICE_REMINDER &&
            (job.data as EmailReminderJobData).invoiceId === invoiceId,
        )
        .map((job) => ({
          jobId: job.id.toString(),
          status: 'pending',
          scheduledFor: job.opts.delay
            ? new Date(job.timestamp + job.opts.delay)
            : undefined,
          data: job.data as EmailReminderJobData,
        }));

      return invoiceJobs;
    } catch (error) {
      this.logger.error(`Failed to get jobs for invoice ${invoiceId}:`, error);
      return [];
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.emailQueue.getWaiting(),
        this.emailQueue.getActive(),
        this.emailQueue.getCompleted(),
        this.emailQueue.getFailed(),
        this.emailQueue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats:', error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      };
    }
  }

  /**
   * Verify mail service connection
   */
  async verifyMailConnection(): Promise<boolean> {
    return await this.mailService.verifyConnection();
  }

  private getPriorityValue(priority?: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high':
        return 1;
      case 'medium':
        return 5;
      case 'low':
        return 10;
      default:
        return 5;
    }
  }
}
