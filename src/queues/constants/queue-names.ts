// Queue names - centralized constants
export const QUEUE_NAMES = {
  EMAIL_REMINDERS: 'email-reminders',
  PDF_GENERATION: 'pdf-generation',
  LEADS_ENRICHMENT: 'leads-enrichment',
} as const;

// Job names within queues
export const JOB_NAMES = {
  EMAIL_REMINDERS: {
    SEND_INVOICE_REMINDER: 'send-invoice-reminder',
  },
  PDF_GENERATION: {
    GENERATE_INVOICE_PDF: 'generate-invoice-pdf',
  },
  LEADS_ENRICHMENT: {
    ENRICH_LEAD_DATA: 'enrich-lead-data',
  },
} as const;
