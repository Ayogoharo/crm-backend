import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { faker } from '@faker-js/faker';
import { InvoiceItem } from 'src/invoice-items/entities/invoice-item.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';

export class InvoiceItemSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const invoiceItemRepository = dataSource.getRepository(InvoiceItem);
    const invoiceRepository = dataSource.getRepository(Invoice);

    // Check if invoice items already exist
    const existingInvoiceItems = await invoiceItemRepository.count();
    if (existingInvoiceItems > 0) {
      console.log('Invoice items already exist, skipping invoice item seeding');
      return;
    }

    // Get existing invoices for relationships
    const invoices = await invoiceRepository.find();

    if (invoices.length === 0) {
      console.log(
        '❌ Cannot create invoice items: invoices not found. Run invoice seeder first.',
      );
      return;
    }

    const serviceDescriptions = [
      'Web Development Services',
      'Consulting Services',
      'Design Services',
      'Marketing Campaign',
      'Software License',
      'Technical Support',
      'Project Management',
      'Data Analysis',
      'SEO Optimization',
      'Content Creation',
    ];

    const createRandomInvoiceItem = (invoice: Invoice) => {
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = parseFloat(
        faker.commerce.price({ min: 50, max: 500, dec: 2 }),
      );
      const lineTotal = parseFloat((quantity * unitPrice).toFixed(2));

      return {
        description: faker.helpers.arrayElement(serviceDescriptions),
        quantity,
        unitPrice,
        lineTotal,
        invoice,
      };
    };

    const invoiceItems: InvoiceItem[] = [];

    // Create 1-5 items per invoice
    for (const invoice of invoices) {
      const itemCount = faker.number.int({ min: 1, max: 5 });

      for (let i = 0; i < itemCount; i++) {
        const itemData = createRandomInvoiceItem(invoice);
        const invoiceItem = new InvoiceItem();
        Object.assign(invoiceItem, itemData);
        invoiceItems.push(invoiceItem);
      }
    }

    await invoiceItemRepository.save(invoiceItems);
    console.log(`✅ Created ${invoiceItems.length} invoice items`);

    // Update invoice totals based on items
    for (const invoice of invoices) {
      const items = await invoiceItemRepository.find({
        where: { invoice: { id: invoice.id } },
      });

      const totalAmount = parseFloat(
        items
          .reduce((sum, item) => sum + parseFloat(item.lineTotal.toString()), 0)
          .toFixed(2),
      );

      await invoiceRepository.update(invoice.id, { totalAmount });
    }

    console.log(`✅ Updated invoice totals`);
  }
}
