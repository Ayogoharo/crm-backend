import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTestApp } from '../utils/test-app-setup.helper';
import {
  loginAsAdmin,
  loginAsAccountant,
  loginAsSales,
  withAuth,
} from '../utils/auth-helpers';
import { Client } from '../../src/clients/entities/client.entity';
import { Invoice } from '../../src/invoices/entities/invoice.entity';
import { InvoiceTestDataFactory } from '../../src/invoices/test-utils/invoice-test-data.factory';

describe('Authentication & Authorization (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Authentication Tests', () => {
    it('should reject unauthenticated requests to protected endpoints', async () => {
      await request(app.getHttpServer()).get('/invoices').expect(401);

      await request(app.getHttpServer()).get('/clients').expect(401);

      await request(app.getHttpServer()).get('/payments').expect(401);
    });

    it('should allow authenticated requests', async () => {
      const { token } = await loginAsAccountant(app);

      await withAuth(
        request(app.getHttpServer()).get('/invoices'),
        token,
      ).expect(200);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow accountant to create invoices', async () => {
      // Arrange
      const { token, user } = await loginAsAccountant(app);
      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );

      const timestamp = Date.now();
      const client = await clientRepository.save({
        name: `Test Client ${timestamp}`,
        email: `client${timestamp}@test.com`,
        phone: `+123456${timestamp.toString().slice(-4)}`,
        address: `Test Address ${timestamp}`,
      });

      const invoiceData = InvoiceTestDataFactory.createValidInvoiceData({
        clientId: client.id,
        issuedBy: user.id,
      });

      // Act & Assert
      const response = await withAuth(
        request(app.getHttpServer()).post('/invoices'),
        token,
      )
        .send(invoiceData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should allow admin to delete invoices', async () => {
      // Arrange: Create test data first
      const accountant = await loginAsAccountant(app);
      const admin = await loginAsAdmin(app);

      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );
      const invoiceRepository = app.get<Repository<Invoice>>(
        getRepositoryToken(Invoice),
      );

      const timestamp = Date.now();
      const client = await clientRepository.save({
        name: `Test Client ${timestamp}`,
        email: `client${timestamp}@test.com`,
        phone: `+123456${timestamp.toString().slice(-4)}`,
        address: `Test Address ${timestamp}`,
      });

      const invoice = await invoiceRepository.save(
        InvoiceTestDataFactory.createValidInvoiceData({
          clientId: client.id,
          issuedBy: accountant.user.id,
        }),
      );

      // Act & Assert: Admin should be able to delete
      await withAuth(
        request(app.getHttpServer()).delete(`/invoices/${invoice.id}`),
        admin.token,
      ).expect(200);
    });

    it('should allow sales to create clients but not invoices', async () => {
      const { token } = await loginAsSales(app);

      // Sales can create clients
      const timestamp = Date.now();
      await withAuth(request(app.getHttpServer()).post('/clients'), token)
        .send({
          name: `Sales Test Client ${timestamp}`,
          email: `salesclient${timestamp}@test.com`,
          phone: `+123456${timestamp.toString().slice(-4)}`,
          address: `Sales Test Address ${timestamp}`,
        })
        .expect(201);

      // But sales cannot create invoices (should get 403 Forbidden)
      await withAuth(request(app.getHttpServer()).post('/invoices'), token)
        .send(
          InvoiceTestDataFactory.createValidInvoiceData({
            clientId: 1,
            issuedBy: 1,
          }),
        )
        .expect(403);
    });
  });

  describe('Public Endpoints', () => {
    it('should allow access to auth endpoints without token', async () => {
      // Login endpoint should be accessible without auth
      const timestamp = Date.now();

      // First create a user to login with
      const { user } = await loginAsAdmin(app);

      // Then test login endpoint
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'Test123456!', // This is the plain password we use in auth helpers
        })
        .expect(201);
    });

    it('should allow access to basic app endpoint', async () => {
      await request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });
});
