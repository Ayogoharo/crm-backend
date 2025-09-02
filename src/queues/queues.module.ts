import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { InvoiceItem } from 'src/invoice-items/entities/invoice-item.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Lead } from 'src/modules/leads/domain/entities/lead.entity';

// Queue Services (API Layer)
import { EmailQueueService } from './services/email-queue.service';
import { PdfQueueService } from './services/pdf-queue.service';
import { LeadsQueueService } from './services/leads-queue.service';

// Background Processors (Isolated from API)
import { EmailReminderProcessor } from './processors/email-reminder.processor';
import { PdfGenerationProcessor } from './processors/pdf-generation.processor';
import { LeadsEnrichmentProcessor } from './processors/leads-enrichment.processor';

// Constants
import { QUEUE_NAMES } from './constants/queue-names';

@Module({
  imports: [
    // Register Bull queues
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL_REMINDERS },
      { name: QUEUE_NAMES.PDF_GENERATION },
      { name: QUEUE_NAMES.LEADS_ENRICHMENT },
    ),

    // TypeORM entities for processors
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Client, Lead]),
  ],
  providers: [
    // API Layer Services (for dispatching jobs)
    EmailQueueService,
    PdfQueueService,
    LeadsQueueService,

    // Background Processors (isolated from API)
    EmailReminderProcessor,
    PdfGenerationProcessor,
    LeadsEnrichmentProcessor,
  ],
  exports: [
    // Only export API layer services
    EmailQueueService,
    PdfQueueService,
    LeadsQueueService,
  ],
})
export class QueuesModule {}
