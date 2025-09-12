import { faker } from '@faker-js/faker';
import { CreateInvoiceItemBodyDto } from '../dto/create-invoice-item-body.dto';

export class InvoiceItemTestDataFactory {
  static createValidInvoiceItemData(
    overrides: Partial<CreateInvoiceItemBodyDto> = {},
  ): CreateInvoiceItemBodyDto {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const unitPrice = faker.number.float({
      min: 10,
      max: 200,
      fractionDigits: 2,
    });
    const lineTotal = quantity * unitPrice;

    return {
      invoiceId: faker.number.int(),
      description: faker.commerce.productName(),
      quantity,
      unitPrice,
      lineTotal,
      ...overrides,
    };
  }
}
