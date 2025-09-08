import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import bull from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Client } from '../clients/entities/client.entity';
import { EmailReminderJobData } from '../queues/interfaces/job-data.interfaces';
import { JOB_NAMES } from '../queues/constants/queue-names';

export interface EmailJobResult {
  success: boolean;
  message: string;
  emailSent?: boolean;
  emailProvider?: string;
  data?: any;
  error?: string;
}

@Processor('email-reminders')
@Injectable()
export class MailQueueProcessor {
  private readonly logger = new Logger(MailQueueProcessor.name);

  constructor(
    private readonly mailService: MailService,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  @Process(JOB_NAMES.EMAIL_REMINDERS.SEND_INVOICE_REMINDER)
  async handleInvoiceReminder(
    job: bull.Job<EmailReminderJobData>,
  ): Promise<EmailJobResult> {
    this.logger.log(`Processing invoice reminder job ${job.id}`);

    try {
      const {
        invoiceId,
        clientEmail,
        clientName,
        dueDate,
        totalAmount,
        invoiceNumber,
      } = job.data;

      // Update job progress
      await job.progress(10);

      // Verify invoice still exists and is unpaid (business logic validation)
      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
        relations: ['client'],
      });

      if (!invoice) {
        this.logger.warn(`Invoice ${invoiceId} not found, skipping reminder`);
        return {
          success: false,
          message: 'Invoice not found',
          error: 'Invoice may have been deleted',
        };
      }

      // Check if invoice is still unpaid
      if (invoice.status === 'paid' || invoice.status === 'cancelled') {
        this.logger.log(
          `Invoice ${invoiceId} is ${invoice.status}, skipping reminder`,
        );
        return {
          success: true,
          message: `Invoice is ${invoice.status}, no reminder needed`,
        };
      }

      await job.progress(30);

      // Create email content using the mail service template
      const emailContent = this.mailService.createInvoiceReminderEmail(
        clientName,
        invoiceNumber || `INV-${invoiceId}`,
        dueDate,
        totalAmount,
      );

      await job.progress(60);

      // Send the email
      const success = await this.mailService.sendEmail({
        to: clientEmail,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      await job.progress(90);

      if (success) {
        this.logger.log(`Invoice reminder sent successfully for job ${job.id}`);
        await job.progress(100);
        return {
          success: true,
          message: 'Invoice reminder sent successfully',
          emailSent: true,
          emailProvider: 'nodemailer',
        };
      } else {
        throw new Error('Failed to send email via mail service');
      }
    } catch (error) {
      this.logger.error(
        `Failed to process invoice reminder job ${job.id}:`,
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: 'Failed to send invoice reminder',
        error: errorMessage,
      };
    }
  }
}
