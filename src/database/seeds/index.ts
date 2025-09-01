import { DataSource } from 'typeorm';
import { UserSeeder } from './user.seeder';
import { ClientSeeder } from './client.seeder';
import { LeadSeeder } from './lead.seeder';
import { InvoiceSeeder } from './invoice.seeder';
import { InvoiceItemSeeder } from './invoice-item.seeder';
import { PaymentSeeder } from './payment.seeder';

export async function runAllSeeders(dataSource: DataSource): Promise<void> {
  console.log('🌱 Starting database seeding...');

  try {
    // Run seeders in order (respecting dependencies)
    const userSeeder = new UserSeeder();
    await userSeeder.run(dataSource);

    const clientSeeder = new ClientSeeder();
    await clientSeeder.run(dataSource);

    const leadSeeder = new LeadSeeder();
    await leadSeeder.run(dataSource);

    const invoiceSeeder = new InvoiceSeeder();
    await invoiceSeeder.run(dataSource);

    const invoiceItemSeeder = new InvoiceItemSeeder();
    await invoiceItemSeeder.run(dataSource);

    const paymentSeeder = new PaymentSeeder();
    await paymentSeeder.run(dataSource);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

export {
  UserSeeder,
  ClientSeeder,
  LeadSeeder,
  InvoiceSeeder,
  InvoiceItemSeeder,
  PaymentSeeder,
};
