import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { LeadsModule } from './modules/leads/leads.module';
import { InvoicesModule } from './invoices/invoices.module';
import { InvoiceItemsModule } from './invoice-items/invoice-items.module';
import { PaymentsModule } from './payments/payments.module';
import { QueuesModule } from './queues/queues.module';
import { MailModule } from './mail/mail.module';
import { MetricsModule } from './metrics/metrics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { LoggerModule } from 'nestjs-pino';
import { getLoggerConfig } from './config/logger.config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrometheusModule.register(),
    LoggerModule.forRoot({
      pinoHttp: getLoggerConfig(),
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    QueuesModule,
    MailModule,
    MetricsModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    LeadsModule,
    InvoicesModule,
    InvoiceItemsModule,
    PaymentsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: `${process.env.POSTGRES_HOST}`,
      port: Number(process.env.POSTGRES_PORT),
      username: `${process.env.POSTGRES_USER}`,
      password: `${process.env.POSTGRES_PASSWORD}`,
      database: `${process.env.POSTGRES_DB}`,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
