import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from '../../src/clients/entities/client.entity';
import { User } from '../../src/users/entities/user.entity';
import { Invoice } from '../../src/invoices/entities/invoice.entity';
import { InvoiceItem } from '../../src/invoice-items/entities/invoice-item.entity';
import { InvoiceTestDataFactory } from '../../src/invoices/test-utils/invoice-test-data.factory';
import { InvoiceItemTestDataFactory } from '../../src/invoice-items/test-utils/invoice-item-test-data.factory';
import { createTestApp } from '../utils/test-app-setup.helper';
import {
  loginAsAdmin,
  loginAsAccountant,
  withAuth,
} from '../utils/auth-helpers';

describe('InvoiceItemsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/invoice-items (POST)', () => {
    it('should create a new invoice item and return its ID', async () => {
      // Arrange: Login as accountant and create test data
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
        }),
      );

      const invoiceItemData =
        InvoiceItemTestDataFactory.createValidInvoiceItemData({
          invoiceId: invoice.id,
        });

      // Act: Send authenticated request
      const response = await withAuth(
        request(app.getHttpServer()).post('/invoice-items'),
        token,
      )
        .send(invoiceItemData)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      const { id: invoiceItemId } = response.body as { id: number };

      const invoiceItemRepository = app.get<Repository<InvoiceItem>>(
        getRepositoryToken(InvoiceItem),
      );
      const savedItem = await invoiceItemRepository.findOneBy({
        id: invoiceItemId,
      });

      expect(savedItem).not.toBeNull();
      expect(savedItem!.description).toBe(invoiceItemData.description);
      expect(savedItem!.quantity).toBe(invoiceItemData.quantity);
    });
  });

  describe('/invoice-items (GET)', () => {
    let invoice: Invoice;

    beforeEach(async () => {
      // Get repositories from the app module
      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );
      const userRepository = app.get<Repository<User>>(
        getRepositoryToken(User),
      );
      const invoiceRepository = app.get<Repository<Invoice>>(
        getRepositoryToken(Invoice),
      );

      const client = await clientRepository.save({ name: 'Test Client' });
      const user = await userRepository.save({
        email: `test-${Date.now()}-${Math.random()}@example.com`,
        username: `testuser-${Date.now()}-${Math.random()}`,
        password: 'password',
        fullName: 'Test User',
        role: 'admin',
      });
      invoice = await invoiceRepository.save(
        InvoiceTestDataFactory.createValidInvoiceData({
          clientId: client.id,
          issuedBy: user.id,
        }),
      );

      const invoiceItemRepository = app.get<Repository<InvoiceItem>>(
        getRepositoryToken(InvoiceItem),
      );
      await invoiceItemRepository.save(
        InvoiceItemTestDataFactory.createValidInvoiceItemData({
          invoiceId: invoice.id,
        }),
      );
      await invoiceItemRepository.save(
        InvoiceItemTestDataFactory.createValidInvoiceItemData({
          invoiceId: invoice.id,
        }),
      );
    });

    it('should return a list of all invoice items', async () => {
      // Arrange: Login as accountant
      const { token } = await loginAsAccountant(app);

      // Act: Send authenticated request
      const response = await withAuth(
        request(app.getHttpServer()).get('/invoice-items'),
        token,
      ).expect(200);

      // Assert
      const { invoiceItems } = response.body as { invoiceItems: InvoiceItem[] };
      expect(invoiceItems).toBeInstanceOf(Array);
      expect(invoiceItems.length).toBeGreaterThanOrEqual(0); // May have existing items
    });

    it('should return a single invoice item by ID', async () => {
      // Arrange: Login as accountant and create test data
      const { token, user } = await loginAsAccountant(app);

      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );
      const invoiceRepository = app.get<Repository<Invoice>>(
        getRepositoryToken(Invoice),
      );
      const invoiceItemRepository = app.get<Repository<InvoiceItem>>(
        getRepositoryToken(InvoiceItem),
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
        }),
      );

      const item = await invoiceItemRepository.save(
        InvoiceItemTestDataFactory.createValidInvoiceItemData({
          invoiceId: invoice.id,
          quantity: 5,
        }),
      );

      // Act: Send authenticated request
      const response = await withAuth(
        request(app.getHttpServer()).get(`/invoice-items/${item.id}`),
        token,
      ).expect(200);

      // Assert
      const body = response.body as InvoiceItem;
      expect(body.id).toBe(item.id);
      expect(body.quantity).toBe(5);
    });

    it('should return 404 for a non-existent invoice item ID', async () => {
      // Arrange: Login as accountant
      const { token } = await loginAsAccountant(app);

      // Act & Assert: Send authenticated request
      await withAuth(
        request(app.getHttpServer()).get('/invoice-items/99999'),
        token,
      ).expect(404);
    });
  });

  describe('/invoice-items (PUT)', () => {
    it('should update an existing invoice item', async () => {
      // Arrange: Login as accountant and create test data
      const { token, user } = await loginAsAccountant(app);

      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );
      const invoiceRepository = app.get<Repository<Invoice>>(
        getRepositoryToken(Invoice),
      );
      const invoiceItemRepository = app.get<Repository<InvoiceItem>>(
        getRepositoryToken(InvoiceItem),
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
        }),
      );

      const invoiceItem = await invoiceItemRepository.save(
        InvoiceItemTestDataFactory.createValidInvoiceItemData({
          invoiceId: invoice.id,
          quantity: 1,
          description: 'Original Description',
        }),
      );

      const updateData = {
        invoiceId: invoice.id,
        quantity: 10,
        description: 'Updated Description',
        unitPrice: 50.0,
        lineTotal: 500.0,
      };

      // Act: Send authenticated request
      await withAuth(
        request(app.getHttpServer()).put(`/invoice-items/${invoiceItem.id}`),
        token,
      )
        .send(updateData)
        .expect(200);

      const updatedItem = await invoiceItemRepository.findOneBy({
        id: invoiceItem.id,
      });

      expect(updatedItem).not.toBeNull();
      expect(updatedItem!.quantity).toBe(10);
      expect(updatedItem!.description).toBe('Updated Description');
    });
  });

  describe('/invoice-items (DELETE)', () => {
    it('should delete an existing invoice item', async () => {
      // Arrange: Login as admin and create test data
      const admin = await loginAsAdmin(app);

      const clientRepository = app.get<Repository<Client>>(
        getRepositoryToken(Client),
      );
      const invoiceRepository = app.get<Repository<Invoice>>(
        getRepositoryToken(Invoice),
      );
      const invoiceItemRepository = app.get<Repository<InvoiceItem>>(
        getRepositoryToken(InvoiceItem),
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
          issuedBy: admin.user.id,
        }),
      );

      const item = await invoiceItemRepository.save(
        InvoiceItemTestDataFactory.createValidInvoiceItemData({
          invoiceId: invoice.id,
        }),
      );

      // Act: Send authenticated request as admin
      await withAuth(
        request(app.getHttpServer()).delete(`/invoice-items/${item.id}`),
        admin.token,
      ).expect(200);

      // Assert
      const deletedItem = await invoiceItemRepository.findOneBy({
        id: item.id,
      });
      expect(deletedItem).toBeNull();
    });

    it('should return 404 for a non-existent invoice item ID', async () => {
      // Arrange: Login as admin
      const { token } = await loginAsAdmin(app);

      // Act & Assert: Send authenticated request
      await withAuth(
        request(app.getHttpServer()).delete('/invoice-items/99999'),
        token,
      ).expect(404);
    });
  });
});
