import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetricsService } from './metrics.service';
import { Lead, LeadStatus } from '../modules/leads/domain/entities/lead.entity';
import { Client } from '../clients/entities/client.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class ScheduledMetricsService {
  constructor(
    private readonly metricsService: MetricsService,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateBusinessMetrics() {
    await Promise.all([
      this.updateActiveLeadsCount(),
      this.updateTotalClientsCount(),
      this.updateOverdueInvoicesCount(),
      this.updateTotalRevenue(),
    ]);
  }

  private async updateActiveLeadsCount() {
    try {
      const activeLeadsCount = await this.leadRepository.count({
        where: { status: LeadStatus.NEW },
      });
      this.metricsService.setActiveLeads(activeLeadsCount);
    } catch (error) {
      console.error('Error updating active leads metric:', error);
    }
  }

  private async updateTotalClientsCount() {
    try {
      const totalClientsCount = await this.clientRepository.count();
      this.metricsService.setTotalClients(totalClientsCount);
    } catch (error) {
      console.error('Error updating total clients metric:', error);
    }
  }

  private async updateOverdueInvoicesCount() {
    try {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const overdueInvoicesCount = await this.invoiceRepository.count({
        where: {
          dueDate: new Date() < currentDate ? new Date() : undefined,
          status: 'sent',
        },
      });
      this.metricsService.setOverdueInvoices(overdueInvoicesCount);
    } catch (error) {
      console.error('Error updating overdue invoices metric:', error);
    }
  }

  private async updateTotalRevenue() {
    try {
      const result = await this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .getRawOne();

      const totalRevenue = parseFloat((result?.total as string) || '0');
      this.metricsService.setTotalRevenue(totalRevenue);
    } catch (error) {
      console.error('Error updating total revenue metric:', error);
    }
  }
}
