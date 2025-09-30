import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Security middleware
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  // Enable validation pipes globally with class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        excludeExtraneousValues: false,
      },
    }),
  );

  // Enable global serializer interceptor for consistent data sanitization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Setup Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('CRM Backend API')
    .setDescription(
      `
      A comprehensive CRM backend API with JWT authentication and role-based access control.

      ## Authentication
      This API uses JWT Bearer token authentication. To authenticate:
      1. POST to /auth/login with email and password
      2. Use the returned access_token as Bearer token in Authorization header
      3. Format: "Authorization: Bearer <token>"

      ## Roles
      - **admin**: Full access to all resources
      - **accountant**: Can manage invoices, invoice items, and view clients
      - **sales**: Can manage leads and clients

      ## Rate Limiting
      API endpoints are rate limited. See response headers for current limits.
    `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('clients', 'Client management')
    .addTag('leads', 'Lead management (Clean Architecture/DDD)')
    .addTag('invoices', 'Invoice management')
    .addTag('invoice-items', 'Invoice item management')
    .addTag('payments', 'Payment management')
    .addTag('metrics', 'Prometheus metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      authAction: {
        'JWT-auth': {
          name: 'JWT-auth',
          schema: {
            type: 'http',
            in: 'header',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value: 'Bearer <JWT token>',
        },
      },
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  logger.log(
    `API Documentation available at: http://localhost:${port}/api`,
    'Bootstrap',
  );
}
void bootstrap();
