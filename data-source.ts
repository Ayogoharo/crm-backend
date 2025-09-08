import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Client } from 'src/clients/entities/client.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { InvoiceItem } from 'src/invoice-items/entities/invoice-item.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { InitialMigration1756396888643 } from 'migrations/1756396888643-InitialMigration';
import { RenamePasswordHashToPassword1756398000000 } from 'migrations/1756398000000-RenamePasswordHashToPassword';
import { Lead } from 'src/modules/leads/domain/entities/lead.entity';

// Load environment variables
config();

// Function to create data source with dynamic configuration
export const createDataSource = (useTestDb = false) => {
  const prefix = useTestDb ? 'TEST_' : '';

  return new DataSource({
    type: 'postgres',
    host: process.env[`${prefix}POSTGRES_HOST`] || 'localhost',
    port: process.env[`${prefix}POSTGRES_PORT`]
      ? parseInt(`${process.env[`${prefix}POSTGRES_PORT`]}`)
      : useTestDb
        ? 5433
        : 5432,
    username: process.env[`${prefix}POSTGRES_USER`] || 'postgres',
    password: process.env[`${prefix}POSTGRES_PASSWORD`] || 'password',
    database:
      process.env[`${prefix}POSTGRES_DB`] ||
      (useTestDb ? 'crm_test_db' : 'crm_db'),
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Client, Lead, Invoice, InvoiceItem, Payment],
    migrations: [
      InitialMigration1756396888643,
      RenamePasswordHashToPassword1756398000000,
    ],
    migrationsTableName: 'migrations',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });
};

// Default data source for main database
export const AppDataSource = createDataSource(false);

// Test data source
export const TestDataSource = createDataSource(true);
