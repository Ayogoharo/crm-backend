import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { faker } from '@faker-js/faker';
import { Payment } from 'src/payments/entities/payment.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { User } from 'src/users/entities/user.entity';

const PaymentMethod = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
} as const;

export class PaymentSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const paymentRepository = dataSource.getRepository(Payment);
    const invoiceRepository = dataSource.getRepository(Invoice);
    const userRepository = dataSource.getRepository(User);

    // Check if payments already exist
    const existingPayments = await paymentRepository.count();
    if (existingPayments > 0) {
      console.log('Payments already exist, skipping payment seeding');
      return;
    }

    // Get existing invoices and users for relationships
    const invoices = await invoiceRepository.find();
    const users = await userRepository.find();

    if (invoices.length === 0 || users.length === 0) {
      console.log(
        '❌ Cannot create payments: invoices or users not found. Run invoice and user seeders first.',
      );
      return;
    }

    const createRandomPayment = (invoice: Invoice) => {
      const recordedByUser = faker.helpers.arrayElement(users);
      const paymentDate = faker.date.between({
        from: invoice.invoiceDate,
        to: new Date(),
      });

      // Payment amount should be between 10% and 100% of invoice total
      const paymentAmount = parseFloat(
        (
          invoice.totalAmount * faker.number.float({ min: 0.1, max: 1.0 })
        ).toFixed(2),
      );

      return {
        invoiceId: invoice.id,
        recordedBy: recordedByUser.id,
        paymentDate,
        amount: paymentAmount,
        method: faker.helpers.enumValue(PaymentMethod),
        reference: faker.finance.transactionDescription(),
      };
    };

    const payments: Payment[] = [];

    // Create payments for about 60% of invoices (some invoices remain unpaid)
    const invoicesToPay = faker.helpers.arrayElements(
      invoices,
      Math.floor(invoices.length * 0.6),
    );

    for (const invoice of invoicesToPay) {
      // Some invoices might have multiple partial payments
      const paymentCount = faker.helpers.weightedArrayElement([
        { weight: 0.7, value: 1 }, // 70% single payment
        { weight: 0.25, value: 2 }, // 25% two payments
        { weight: 0.05, value: 3 }, // 5% three payments
      ]);

      let remainingAmount = invoice.totalAmount;

      for (let i = 0; i < paymentCount && remainingAmount > 0; i++) {
        const paymentData = createRandomPayment(invoice);

        // For multiple payments, adjust the amount
        if (paymentCount > 1) {
          if (i === paymentCount - 1) {
            // Last payment covers remaining amount
            paymentData.amount = parseFloat(remainingAmount.toFixed(2));
          } else {
            // Partial payment
            paymentData.amount = parseFloat(
              (
                remainingAmount * faker.number.float({ min: 0.2, max: 0.6 })
              ).toFixed(2),
            );
          }
        }

        remainingAmount -= paymentData.amount;

        const payment = new Payment();
        Object.assign(payment, paymentData);
        payments.push(payment);
      }
    }

    await paymentRepository.save(payments);
    console.log(
      `✅ Created ${payments.length} payments for ${invoicesToPay.length} invoices`,
    );
  }
}
