import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnhancedEmailQueueService } from './enhanced-email-queue.service';
import { MailQueueProcessor } from './mail-queue.processor';
import { QUEUE_NAMES } from '../queues/constants/queue-names';
import { MailService } from './mail.service';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Client } from '../clients/entities/client.entity';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.EMAIL_REMINDERS,
    }),
    TypeOrmModule.forFeature([Invoice, Client]),
  ],
  providers: [MailService, EnhancedEmailQueueService, MailQueueProcessor],
  exports: [MailService, EnhancedEmailQueueService],
})
export class MailModule {}
