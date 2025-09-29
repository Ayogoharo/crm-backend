import { Module } from '@nestjs/common';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { AuthModule } from '../../src/auth/auth.module';
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
import { TestLoggerModule } from './test-logger.setup';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TestLoggerModule,
    BullModule.forRoot({
      redis: {
        host: `${process.env.REDIS_HOST}`,
        port: Number(process.env.REDIS_PORT),
        password: `${process.env.REDIS_PASSWORD}`,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: `${process.env.TEST_POSTGRES_HOST}`,
      port: Number(process.env.TEST_POSTGRES_PORT),
      username: `${process.env.TEST_POSTGRES_USER}`,
      password: `${process.env.TEST_POSTGRES_PASSWORD}`,
      database: `${process.env.TEST_POSTGRES_DB}`,
      autoLoadEntities: true,
      synchronize: false, // Don't auto-sync, use migrations
      dropSchema: false, // Don't drop schema automatically
      migrationsRun: false, // Use existing seeded data
    }),
    QueuesModule,
    MailModule,
    AuthModule,
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
