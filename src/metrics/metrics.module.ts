import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MetricsService } from './metrics.service';
import { ScheduledMetricsService } from './scheduled-metrics.service';
import { MetricsController } from './metrics.controller';
import { Lead } from '../modules/leads/domain/entities/lead.entity';
import { Client } from '../clients/entities/client.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    PrometheusModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Lead, Client, Invoice, Payment]),
  ],
  providers: [
    MetricsService,
    ScheduledMetricsService,
    makeCounterProvider({
      name: 'crm_api_requests_total',
      help: 'Total number of API requests',
      labelNames: ['method', 'endpoint', 'status_code'],
    }),
    makeHistogramProvider({
      name: 'crm_api_request_duration_seconds',
      help: 'API request duration in seconds',
      labelNames: ['method', 'endpoint'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    }),
    makeGaugeProvider({
      name: 'crm_active_leads_total',
      help: 'Total number of active leads',
    }),
    makeGaugeProvider({
      name: 'crm_total_clients',
      help: 'Total number of clients',
    }),
    makeCounterProvider({
      name: 'crm_invoices_created_total',
      help: 'Total number of invoices created',
      labelNames: ['client_id'],
    }),
    makeCounterProvider({
      name: 'crm_payments_received_total',
      help: 'Total number of payments received',
      labelNames: ['invoice_id'],
    }),
    makeGaugeProvider({
      name: 'crm_overdue_invoices_total',
      help: 'Total number of overdue invoices',
    }),
    makeGaugeProvider({
      name: 'crm_total_revenue',
      help: 'Total revenue amount',
    }),
    makeCounterProvider({
      name: 'crm_background_jobs_total',
      help: 'Total number of background jobs processed',
      labelNames: ['job_type', 'status'],
    }),
  ],
  controllers: [MetricsController],
  exports: [MetricsService],
})
export class MetricsModule {}
