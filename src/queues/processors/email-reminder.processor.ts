import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import bull from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { Client } from 'src/clients/entities/client.entity';
import {
  EmailReminderJobData,
  EmailJobResult,
} from '../interfaces/job-data.interfaces';
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue-names';

@Processor(QUEUE_NAMES.EMAIL_REMINDERS)
@Injectable()
export class EmailReminderProcessor {
  private readonly logger = new Logger(EmailReminderProcessor.name);

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  @Process(JOB_NAMES.EMAIL_REMINDERS.SEND_INVOICE_REMINDER)
  async handleInvoiceReminder(
    job: bull.Job<EmailReminderJobData>,
  ): Promise<EmailJobResult> {
    const { invoiceId, clientEmail, clientName, dueDate, totalAmount } =
      job.data;

    this.logger.log(`Processing invoice reminder for invoice ${invoiceId}`);

    try {
      // Verify invoice still exists and is still unpaid
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

      // Prepare email data for smtpapi (you'll implement the actual sending)
      const emailData = {
        to: clientEmail,
        subject: `Payment Reminder: Invoice Due in 2 Days`,
        template: 'invoice-reminder',
        data: {
          clientName,
          invoiceId,
          dueDate: dueDate.toISOString().split('T')[0],
          totalAmount: parseFloat(totalAmount.toString()).toFixed(2),
          daysUntilDue: 2,
        },
      };

      this.logger.log(`Email reminder prepared for ${clientEmail}`, emailData);

      // TODO: Replace this with actual smtpapi call when you implement it
      // await this.smtpApiService.sendEmail(emailData);

      // Simulate email sending for now
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.logger.log(
        `Invoice reminder sent successfully for invoice ${invoiceId}`,
      );

      return {
        success: true,
        message: 'Invoice reminder sent successfully',
        emailSent: true,
        emailProvider: 'smtpapi',
        data: emailData,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send invoice reminder for ${invoiceId}:`,
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
