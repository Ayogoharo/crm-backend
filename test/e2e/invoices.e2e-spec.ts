import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvoiceTestDataFactory } from '../../src/invoices/test-utils/invoice-test-data.factory';
import { Client } from '../../src/clients/entities/client.entity';
import { Invoice } from '../../src/invoices/entities/invoice.entity';
import { createTestApp } from '../utils/test-app-setup.helper';
import {
  loginAsAdmin,
  loginAsAccountant,
  withAuth,
} from '../utils/auth-helpers';

describe('InvoicesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/invoices (POST)', () => {
    it('should create a new invoice and return its ID', async () => {
      // Arrange: Login as accountant (who can create invoices)
      const { token, user } = await loginAsAccountant(app);

      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );

      // Create unique test client to avoid conflicts
      const timestamp = Date.now();
      const client = await clientRepository.save({
        name: `Test Client for Invoice ${timestamp}`,
        email: `client${timestamp}@example.com`,
        phone: `+1234567${timestamp.toString().slice(-3)}`,
        address: `Test Address ${timestamp}`,
      });

      const invoiceData = InvoiceTestDataFactory.createValidInvoiceData({
        clientId: client.id,
        issuedBy: user.id,
      });

      // Act: Send authenticated request to the server
      const response = await withAuth(
        request(app.getHttpServer()).post('/invoices'),
        token,
      )
        .send(invoiceData)
        .expect(201);

      // Assert: Check the response and the database
      expect(response.body).toHaveProperty('id');
      const { id: invoiceId } = response.body as { id: number };

      const invoiceRepository = app.get<Repository<Invoice>>(
        getRepositoryToken(Invoice),
      );
      const savedInvoice = await invoiceRepository.findOneBy({ id: invoiceId });

      expect(savedInvoice).not.toBeNull();
      expect(savedInvoice!.clientId).toBe(client.id);
      expect(savedInvoice!.issuedBy).toBe(user.id);
      expect(savedInvoice!.status).toBe(invoiceData.status);
    });

    it('should reject unauthenticated requests', async () => {
      // Arrange
      const invoiceData = InvoiceTestDataFactory.createValidInvoiceData({
        clientId: 1,
        issuedBy: 1,
      });

      // Act & Assert: Request without authentication should fail
      await request(app.getHttpServer())
        .post('/invoices')
        .send(invoiceData)
        .expect(401);
    });
  });

  describe('/invoices (GET)', () => {
    it('should return a list of all invoices', async () => {
      // Arrange: Login and create test data
      const { token, user } = await loginAsAccountant(app);

      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );
      const invoiceRepository = app.get<Repository<Invoice>>(
        getRepositoryToken(Invoice),
      );

      // Create unique test data
      const timestamp = Date.now();
      const client = await clientRepository.save({
        name: `Test Client ${timestamp}`,
        email: `client${timestamp}@test.com`,
        phone: `+123456${timestamp.toString().slice(-4)}`,
        address: `Test Address ${timestamp}`,
      });

      await invoiceRepository.save(
        InvoiceTestDataFactory.createValidInvoiceData({
          clientId: client.id,
          issuedBy: user.id,
        }),
      );
      await invoiceRepository.save(
        InvoiceTestDataFactory.createValidInvoiceData({
          clientId: client.id,
          issuedBy: user.id,
        }),
      );

      // Act: Send authenticated request
      const response = await withAuth(
        request(app.getHttpServer()).get('/invoices'),
        token,
      ).expect(200);

      // Assert
      const { invoices } = response.body as { invoices: Invoice[] };
      expect(invoices).toBeInstanceOf(Array);
      expect(invoices.length).toBeGreaterThanOrEqual(2); // At least our 2 test invoices
    });

    it('should return a single invoice by ID', async () => {
      // Arrange: Login as accountant
      const { token, user } = await loginAsAccountant(app);

      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );
      const invoiceRepository = app.get<Repository<Invoice>>(
        getRepositoryToken(Invoice),
      );

      const timestamp = Date.now();
      const client = await clientRepository.save({
        name: `Test Client ${timestamp}`,
        email: `client${timestamp}@example.com`,
        phone: `+123456${timestamp.toString().slice(-4)}`,
        address: `Test Address ${timestamp}`,
      });

      const invoice = await invoiceRepository.save(
        InvoiceTestDataFactory.createValidInvoiceData({
          clientId: client.id,
          issuedBy: user.id,
          totalAmount: 123.45,
        }),
      );

      // Act: Send authenticated request
      const response = await withAuth(
        request(app.getHttpServer()).get(`/invoices/${invoice.id}`),
        token,
      ).expect(200);

      // Assert
      const body = response.body as Invoice;
      expect(body.id).toBe(invoice.id);
      expect(body.totalAmount).toBe('123.45');
    });

    it('should return 404 for a non-existent invoice ID', async () => {
      // Arrange: Login as accountant
      const { token } = await loginAsAccountant(app);

      // Act & Assert: Send authenticated request
      await withAuth(
        request(app.getHttpServer()).get('/invoices/99999'),
        token,
      ).expect(404);
    });
  });

  describe('/invoices (PUT)', () => {
    it('should update an existing invoice', async () => {
      // Arrange: Login as accountant
      const { token, user } = await loginAsAccountant(app);

      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );
      const invoiceRepository = app.get<Repository<Invoice>>(
        getRepositoryToken(Invoice),
      );

      const timestamp = Date.now();
      const client = await clientRepository.save({
        name: `Test Client ${timestamp}`,
        email: `client${timestamp}@example.com`,
        phone: `+123456${timestamp.toString().slice(-4)}`,
        address: `Test Address ${timestamp}`,
      });

      const invoice = await invoiceRepository.save(
        InvoiceTestDataFactory.createValidInvoiceData({
          clientId: client.id,
          issuedBy: user.id,
          status: 'draft',
        }),
      );

      const updateData = {
        clientId: client.id,
        issuedBy: user.id,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'sent' as const,
        totalAmount: 500.0,
      };

      // Act: Send authenticated request
      await withAuth(
        request(app.getHttpServer()).put(`/invoices/${invoice.id}`),
        token,
      )
        .send(updateData)
        .expect(200);

      // Assert
      const updatedInvoice = await invoiceRepository.findOneBy({
        id: invoice.id,
      });
      expect(updatedInvoice).not.toBeNull();
      expect(updatedInvoice!.status).toBe('sent');
      expect(updatedInvoice!.totalAmount).toBe('500.00');
    });
  });

  describe('/invoices (DELETE)', () => {
    it('should delete an existing invoice', async () => {
      // Arrange: Create invoice first, then login as admin to delete it
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
        email: `client${timestamp}@example.com`,
        phone: `+123456${timestamp.toString().slice(-4)}`,
        address: `Test Address ${timestamp}`,
      });

      const invoice = await invoiceRepository.save(
        InvoiceTestDataFactory.createValidInvoiceData({
          clientId: client.id,
          issuedBy: accountant.user.id,
        }),
      );

      // Act: Send authenticated request as admin
      await withAuth(
        request(app.getHttpServer()).delete(`/invoices/${invoice.id}`),
        admin.token,
      ).expect(200);

      // Assert
      const deletedInvoice = await invoiceRepository.findOneBy({
        id: invoice.id,
      });
      expect(deletedInvoice).toBeNull();
    });

    it('should return 404 for a non-existent invoice ID', async () => {
      // Arrange: Login as admin
      const { token } = await loginAsAdmin(app);

      // Act & Assert: Send authenticated request
      await withAuth(
        request(app.getHttpServer()).delete('/invoices/99999'),
        token,
      ).expect(404);
    });
  });
});
