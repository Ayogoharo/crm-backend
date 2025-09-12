import { faker } from '@faker-js/faker';
import { CreateInvoiceBodyDto } from '../dto/create-invoice-body.dto';

export class InvoiceTestDataFactory {
  static createValidInvoiceData(
    overrides: Partial<CreateInvoiceBodyDto> = {},
  ): CreateInvoiceBodyDto {
    return {
      clientId: faker.number.int(),
      issuedBy: faker.number.int(),
      invoiceDate: faker.date.past().toISOString(),
      dueDate: faker.date.future().toISOString(),
      status: 'draft',
      totalAmount: faker.number.float({
        min: 100,
        max: 1000,
        fractionDigits: 2,
      }),
      ...overrides,
    };
  }
}
