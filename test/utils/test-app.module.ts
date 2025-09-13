import { Module } from '@nestjs/common';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { UsersModule } from '../../src/users/users.module';
import { ClientsModule } from '../../src/clients/clients.module';
import { LeadsModule } from '../../src/modules/leads/leads.module';
import { InvoicesModule } from '../../src/invoices/invoices.module';
import { InvoiceItemsModule } from '../../src/invoice-items/invoice-items.module';
import { PaymentsModule } from '../../src/payments/payments.module';
import { QueuesModule } from '../../src/queues/queues.module';
import { MailModule } from '../../src/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TestDataSource } from '../../data-source';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TEST_POSTGRES_HOST || 'localhost',
      port: Number(process.env.TEST_POSTGRES_PORT) || 5433,
      username: process.env.TEST_POSTGRES_USER || 'postgres',
      password: process.env.TEST_POSTGRES_PASSWORD || 'password',
      database: process.env.TEST_POSTGRES_DB || 'crm_test_db',
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: true, // Clean database on startup for tests
    }),
    QueuesModule,
    MailModule,
    UsersModule,
    ClientsModule,
    LeadsModule,
    InvoicesModule,
    InvoiceItemsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestAppModule {}