import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface SafeMailResponse {
  messageId?: string;
  envelope?: {
    from: string;
    to: string[];
  };
  accepted?: string[];
  rejected?: string[];
  pending?: string[];
  response?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface EmailJobData {
  id?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  attempts?: number;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT', 587);
    const secure = this.configService.get<boolean>('MAIL_SECURE', false);
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    if (!host || !user || !pass) {
      this.logger.warn(
        'Mail configuration is incomplete. Email sending will be disabled.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    this.logger.log('Mail transporter initialized successfully');
  }

  /**
   * Send email immediately
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error('Mail transporter not initialized. Cannot send email.');
      return false;
    }

    const mailOptions = {
      from: options.from || this.configService.get<string>('MAIL_FROM'),
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    try {
      const info = (await this.transporter.sendMail(
        mailOptions,
      )) as SafeMailResponse;
      const messageId = info.messageId || 'unknown';
      this.logger.log(`Email sent successfully: ${messageId}`);
      this.logger.debug(`Email sent to: ${mailOptions.to}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Verify mail configuration
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.logger.error('Mail transporter not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Mail server connection verified');
      return true;
    } catch (error) {
      this.logger.error('Mail server connection failed:', error);
      return false;
    }
  }

  /**
   * Create email template for invoice reminders
   */
  createInvoiceReminderEmail(
    clientName: string,
    invoiceNumber: string,
    dueDate: Date,
    totalAmount: number,
  ): { subject: string; html: string; text: string } {
    const formattedDate = dueDate.toLocaleDateString();
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(totalAmount);

    const subject = `Payment Reminder: Invoice ${invoiceNumber} Due ${formattedDate}`;

    const text = `
Dear ${clientName},

This is a friendly reminder that your invoice ${invoiceNumber} is due on ${formattedDate}.

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Due Date: ${formattedDate}
- Amount Due: ${formattedAmount}

Please ensure payment is made by the due date to avoid any late fees.

If you have already made the payment, please disregard this message.

Thank you for your business!

Best regards,
Your CRM Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .invoice-details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Payment Reminder</h2>
        </div>
        
        <p>Dear ${clientName},</p>
        
        <p>This is a friendly reminder that your invoice <strong>${invoiceNumber}</strong> is due on <strong>${formattedDate}</strong>.</p>
        
        <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <ul>
                <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
                <li><strong>Due Date:</strong> ${formattedDate}</li>
                <li><strong>Amount Due:</strong> ${formattedAmount}</li>
            </ul>
        </div>
        
        <p>Please ensure payment is made by the due date to avoid any late fees.</p>
        
        <p>If you have already made the payment, please disregard this message.</p>
        
        <p>Thank you for your business!</p>
        
        <div class="footer">
            <p>Best regards,<br>Your CRM Team</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    return { subject, html, text };
  }
}
