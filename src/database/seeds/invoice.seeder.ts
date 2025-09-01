import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { faker } from '@faker-js/faker';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { Client } from 'src/clients/entities/client.entity';
import { User } from 'src/users/entities/user.entity';

const InvoiceStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export class InvoiceSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const invoiceRepository = dataSource.getRepository(Invoice);
    const clientRepository = dataSource.getRepository(Client);
    const userRepository = dataSource.getRepository(User);

    // Check if invoices already exist
    const existingInvoices = await invoiceRepository.count();
    if (existingInvoices > 0) {
      console.log('Invoices already exist, skipping invoice seeding');
      return;
    }

    // Get existing clients and users for relationships
    const clients = await clientRepository.find();
    const users = await userRepository.find();

    if (clients.length === 0 || users.length === 0) {
      console.log(
        '❌ Cannot create invoices: clients or users not found. Run client and user seeders first.',
      );
      return;
    }

    const createRandomInvoice = () => {
      const client = faker.helpers.arrayElement(clients);
      const issuedByUser = faker.helpers.arrayElement(users);
      const invoiceDate = faker.date.past({ years: 1 });
      const dueDate = faker.date.future({ years: 0.1, refDate: invoiceDate });

      return {
        clientId: client.id,
        issuedBy: issuedByUser.id,
        invoiceDate,
        dueDate,
        status: faker.helpers.enumValue(InvoiceStatus),
        totalAmount: parseFloat(
          faker.commerce.price({ min: 100, max: 10000, dec: 2 }),
        ),
      };
    };

    const fakeInvoices = faker.helpers.multiple(createRandomInvoice, {
      count: 40,
    });

    const invoices: Invoice[] = fakeInvoices.map((invoiceData) => {
      const invoice = new Invoice();
      Object.assign(invoice, invoiceData);
      return invoice;
    });

    await invoiceRepository.save(invoices);
    console.log(`✅ Created ${invoices.length} invoices`);
  }
}
