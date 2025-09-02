import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import bull from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { InvoiceItem } from 'src/invoice-items/entities/invoice-item.entity';
import {
  PdfGenerationJobData,
  PdfJobResult,
} from '../interfaces/job-data.interfaces';
import { QUEUE_NAMES, JOB_NAMES } from '../constants/queue-names';
import * as jsPDF from 'jspdf';
import * as fs from 'fs';
import * as path from 'path';

@Processor(QUEUE_NAMES.PDF_GENERATION)
@Injectable()
export class PdfGenerationProcessor {
  private readonly logger = new Logger(PdfGenerationProcessor.name);

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  @Process(JOB_NAMES.PDF_GENERATION.GENERATE_INVOICE_PDF)
  async handlePdfGeneration(
    job: bull.Job<PdfGenerationJobData>,
  ): Promise<PdfJobResult> {
    const { invoiceId, requestedBy } = job.data;

    this.logger.log(`Processing PDF generation for invoice ${invoiceId}`);

    try {
      // Fetch complete invoice data
      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
        relations: ['client', 'issuedByUser', 'invoiceItems'],
      });

      if (!invoice) {
        this.logger.warn(`Invoice ${invoiceId} not found`);
        return {
          success: false,
          message: 'Invoice not found',
          error: 'Invoice may have been deleted',
        };
      }

      // Generate PDF using jsPDF
      const pdf = new jsPDF.jsPDF();

      // PDF Header
      pdf.setFontSize(20);
      pdf.text('INVOICE', 20, 30);

      pdf.setFontSize(12);
      pdf.text(`Invoice #: ${invoice.id}`, 20, 50);
      pdf.text(
        `Date: ${invoice.invoiceDate.toISOString().split('T')[0]}`,
        20,
        60,
      );
      pdf.text(
        `Due Date: ${invoice.dueDate.toISOString().split('T')[0]}`,
        20,
        70,
      );
      pdf.text(`Status: ${invoice.status.toUpperCase()}`, 20, 80);

      // Client Information
      pdf.setFontSize(14);
      pdf.text('Bill To:', 20, 100);
      pdf.setFontSize(12);
      pdf.text(`${invoice.client.name}`, 20, 110);
      pdf.text(`${invoice.client.email}`, 20, 120);
      if (invoice.client.phone) {
        pdf.text(`${invoice.client.phone}`, 20, 130);
      }
      if (invoice.client.address) {
        pdf.text(`${invoice.client.address}`, 20, 140);
      }

      // Invoice Items Table Header
      let yPosition = 170;
      pdf.setFontSize(12);
      pdf.text('Description', 20, yPosition);
      pdf.text('Qty', 120, yPosition);
      pdf.text('Unit Price', 140, yPosition);
      pdf.text('Total', 170, yPosition);

      // Draw line under header
      pdf.line(20, yPosition + 5, 190, yPosition + 5);
      yPosition += 15;

      // Invoice Items
      for (const item of invoice.invoiceItems) {
        pdf.text(item.description, 20, yPosition);
        pdf.text(item.quantity.toString(), 120, yPosition);
        pdf.text(
          `$${parseFloat(item.unitPrice.toString()).toFixed(2)}`,
          140,
          yPosition,
        );
        pdf.text(
          `$${parseFloat(item.lineTotal.toString()).toFixed(2)}`,
          170,
          yPosition,
        );

        yPosition += 10;
      }

      // Totals
      yPosition += 10;
      pdf.line(120, yPosition, 190, yPosition);
      yPosition += 10;
      pdf.text(
        `Total: $${parseFloat(invoice.totalAmount.toString()).toFixed(2)}`,
        140,
        yPosition,
      );

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'invoices');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Save PDF file
      const fileName = `invoice-${invoiceId}-${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      pdf.save(filePath);

      const fileStats = fs.statSync(filePath);

      this.logger.log(
        `PDF generated successfully for invoice ${invoiceId} at ${filePath}`,
      );

      return {
        success: true,
        message: 'PDF generated successfully',
        pdfPath: filePath,
        pdfSize: fileStats.size,
        downloadUrl: `/uploads/invoices/${fileName}`,
        data: {
          fileName,
          invoiceId,
          generatedAt: new Date().toISOString(),
          requestedBy,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate PDF for invoice ${invoiceId}:`,
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: 'Failed to generate PDF',
        error: errorMessage,
      };
    }
  }
}
