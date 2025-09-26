import { Payment } from '../entities/payment.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { User } from 'src/users/entities/user.entity';
import { Client } from 'src/clients/entities/client.entity';
import { CreatePaymentBodyDto } from '../dto/create-payment-body.dto';
import { UpdatePaymentBodyDto } from '../dto/update-payment-body.dto';

export const mockClient: Client = {
  id: 1,
  name: 'Acme Corporation',
  email: 'contact@acme.com',
  phone: '+1-555-0123',
  address: '123 Business St, Suite 100, New York, NY 10001',
  createdAt: new Date('2024-01-01T08:00:00Z'),
  updatedAt: new Date('2024-01-01T08:00:00Z'),
  leads: [],
  invoices: [],
};

export const mockIssuedByUser: User = {
  id: 2,
  email: 'sales@company.com',
  username: 'salesuser',
  password: 'hashedpassword456',
  fullName: 'Jane Smith',
  role: 'sales',
  createdAt: new Date('2024-01-01T08:00:00Z'),
  updatedAt: new Date('2024-01-01T08:00:00Z'),
};

export const mockRecordedByUser: User = {
  id: 1,
  email: 'john.doe@example.com',
  username: 'johndoe',
  password: 'hashedpassword123',
  fullName: 'John Doe',
  role: 'accountant',
  createdAt: new Date('2024-01-01T08:00:00Z'),
  updatedAt: new Date('2024-01-01T08:00:00Z'),
};

export const mockInvoice: Invoice = {
  id: 1,
  clientId: 1,
  issuedBy: 2,
  invoiceDate: new Date('2024-01-01'),
  dueDate: new Date('2024-01-31'),
  status: 'sent',
  totalAmount: 2000,
  createdAt: new Date('2024-01-01T08:00:00Z'),
  updatedAt: new Date('2024-01-01T08:00:00Z'),
  client: mockClient,
  issuedByUser: mockIssuedByUser,
  invoiceItems: [],
  payments: [],
};

export const mockPayment: Payment = {
  id: 1,
  invoiceId: 1,
  recordedBy: 1,
  paymentDate: new Date('2024-01-15'),
  amount: 1000.5,
  method: 'bank_transfer',
  reference: 'REF123456',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  invoice: mockInvoice,
  recordedByUser: mockRecordedByUser,
};

export const mockCreatePaymentDto: CreatePaymentBodyDto = {
  invoiceId: 1,
  recordedBy: 1,
  paymentDate: '2024-01-15',
  amount: 1000.5,
  method: 'bank_transfer',
  reference: 'REF123456',
};

export const mockUpdatePaymentDto: UpdatePaymentBodyDto = {
  invoiceId: 1,
  recordedBy: 1,
  paymentDate: '2024-01-15',
  amount: 1500.75,
  method: 'credit_card',
  reference: 'REF789012',
};

// Factory functions for creating variations of mock data
export const createMockPayment = (
  overrides: Partial<Payment> = {},
): Payment => ({
  ...mockPayment,
  ...overrides,
});

export const createMockCreatePaymentDto = (
  overrides: Partial<CreatePaymentBodyDto> = {},
): CreatePaymentBodyDto => ({
  ...mockCreatePaymentDto,
  ...overrides,
});

export const createMockUpdatePaymentDto = (
  overrides: Partial<UpdatePaymentBodyDto> = {},
): UpdatePaymentBodyDto => ({
  ...mockUpdatePaymentDto,
  ...overrides,
});
