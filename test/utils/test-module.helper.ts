import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../../src/clients/clients.service';
import { Client } from '../../src/clients/entities/client.entity';
import { Lead } from '../../src/modules/leads/domain/entities/lead.entity';
import { Invoice } from '../../src/invoices/entities/invoice.entity';
import { InvoiceItem } from '../../src/invoice-items/entities/invoice-item.entity';
import { Payment } from '../../src/payments/entities/payment.entity';
import { User } from '../../src/users/entities/user.entity';

export class TestModuleHelper {
  /**
   * Create a testing module with TypeORM configuration for integration tests
   */
  static async createTestingModule(): Promise<{
    module: TestingModule;
    service: ClientsService;
    repository: Repository<Client>;
  }> {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_POSTGRES_HOST || 'localhost',
          port: process.env.TEST_POSTGRES_PORT
            ? parseInt(process.env.TEST_POSTGRES_PORT)
            : 5433,
          username: process.env.TEST_POSTGRES_USER || 'postgres',
          password: process.env.TEST_POSTGRES_PASSWORD || 'password',
          database: process.env.TEST_POSTGRES_DB || 'crm_test_db',
          entities: [User, Client, Lead, Invoice, InvoiceItem, Payment],
          synchronize: true,
          dropSchema: false, // We'll handle cleanup manually
          logging: false,
        }),
        TypeOrmModule.forFeature([Client]),
      ],
      providers: [ClientsService],
    }).compile();

    const service = module.get<ClientsService>(ClientsService);
    const repository = module.get<Repository<Client>>('ClientRepository');

    return { module, service, repository };
  }

  /**
   * Close the testing module and clean up resources
   */
  static async closeTestingModule(module: TestingModule): Promise<void> {
    if (module) {
      await module.close();
    }
  }
}
