// Job data interfaces for background processors
export interface EmailReminderJobData {
  invoiceId: number;
  clientEmail: string;
  clientName: string;
  dueDate: Date;
  totalAmount: number;
  invoiceNumber?: string;
}

export interface PdfGenerationJobData {
  invoiceId: number;
  requestedBy?: number; // User ID who requested the PDF
  deliveryMethod?: 'download' | 'email';
  recipientEmail?: string;
}

export interface LeadsEnrichmentJobData {
  leadId: number;
  sourceData: {
    email?: string;
    company?: string;
    phone?: string;
    website?: string;
  };
}

// Job result interfaces
export interface JobResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface EmailJobResult extends JobResult {
  emailSent?: boolean;
  emailProvider?: string;
  messageId?: string;
}

export interface PdfJobResult extends JobResult {
  pdfPath?: string;
  pdfSize?: number;
  downloadUrl?: string;
}

export interface EnrichmentJobResult extends JobResult {
  enrichedData?: Record<string, any>;
  confidence?: number;
  source?: string;
}
