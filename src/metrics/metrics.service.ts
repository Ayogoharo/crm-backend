import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('crm_api_requests_total')
    private readonly apiRequestsCounter: Counter<string>,

    @InjectMetric('crm_api_request_duration_seconds')
    private readonly apiRequestDurationHistogram: Histogram<string>,

    @InjectMetric('crm_active_leads_total')
    private readonly activeLeadsGauge: Gauge<string>,

    @InjectMetric('crm_total_clients')
    private readonly totalClientsGauge: Gauge<string>,

    @InjectMetric('crm_invoices_created_total')
    private readonly invoicesCreatedCounter: Counter<string>,

    @InjectMetric('crm_payments_received_total')
    private readonly paymentsReceivedCounter: Counter<string>,

    @InjectMetric('crm_overdue_invoices_total')
    private readonly overdueInvoicesGauge: Gauge<string>,

    @InjectMetric('crm_total_revenue')
    private readonly totalRevenueGauge: Gauge<string>,

    @InjectMetric('crm_background_jobs_total')
    private readonly backgroundJobsCounter: Counter<string>,
  ) {}

  incrementApiRequests(method: string, endpoint: string, statusCode: string) {
    this.apiRequestsCounter.inc({ method, endpoint, status_code: statusCode });
  }

  recordApiRequestDuration(method: string, endpoint: string, duration: number) {
    this.apiRequestDurationHistogram.observe({ method, endpoint }, duration);
  }

  setActiveLeads(count: number) {
    this.activeLeadsGauge.set(count);
  }

  setTotalClients(count: number) {
    this.totalClientsGauge.set(count);
  }

  incrementInvoicesCreated(clientId: string) {
    this.invoicesCreatedCounter.inc({ client_id: clientId });
  }

  incrementPaymentsReceived(invoiceId: string) {
    this.paymentsReceivedCounter.inc({ invoice_id: invoiceId });
  }

  setOverdueInvoices(count: number) {
    this.overdueInvoicesGauge.set(count);
  }

  setTotalRevenue(amount: number) {
    this.totalRevenueGauge.set(amount);
  }

  incrementBackgroundJobs(jobType: string, status: 'completed' | 'failed') {
    this.backgroundJobsCounter.inc({ job_type: jobType, status });
  }
}
