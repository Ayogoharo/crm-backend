import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { TestAppModule } from '../utils/test-app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from '../../src/clients/entities/client.entity';
import { User } from '../../src/users/entities/user.entity';
import { Invoice } from '../../src/invoices/entities/invoice.entity';
import { InvoiceItem } from '../../src/invoice-items/entities/invoice-item.entity';
import { InvoiceTestDataFactory } from '../../src/invoices/test-utils/invoice-test-data.factory';
import { InvoiceItemTestDataFactory } from '../../src/invoice-items/test-utils/invoice-item-test-data.factory';

describe('InvoiceItemsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/invoice-items (POST)', () => {
    it('should create a new invoice item and return its ID', async () => {
      // Arrange: Create a client, user, and invoice
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
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        fullName: 'Test User',
        role: 'admin',
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

      // Act
      const response = await request(app.getHttpServer())
        .post('/invoice-items')
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
        email: 'test@example.com',
        username: 'testuser',
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
      const response = await request(app.getHttpServer())
        .get('/invoice-items')
        .expect(200);

      const { invoiceItems } = response.body as { invoiceItems: InvoiceItem[] };
      expect(invoiceItems).toBeInstanceOf(Array);
      expect(invoiceItems.length).toBe(2);
    });

    it('should return a single invoice item by ID', async () => {
      // Get repositories from the app module
      const invoiceItemRepository = app.get<Repository<InvoiceItem>>(
        getRepositoryToken(InvoiceItem),
      );
      const item = await invoiceItemRepository.save(
        InvoiceItemTestDataFactory.createValidInvoiceItemData({
          invoiceId: invoice.id,
          quantity: 5,
        }),
      );

      const response = await request(app.getHttpServer())
        .get(`/invoice-items/${item.id}`)
        .expect(200);

      const body = response.body as InvoiceItem;
      expect(body.id).toBe(item.id);
      expect(body.quantity).toBe(5);
    });

    it('should return 404 for a non-existent invoice item ID', async () => {
      await request(app.getHttpServer())
        .get('/invoice-items/99999')
        .expect(404);
    });
  });

  describe('/invoice-items (PUT)', () => {
    let invoice: Invoice;
    let invoiceItem: InvoiceItem;

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
      const invoiceItemRepository = app.get<Repository<InvoiceItem>>(
        getRepositoryToken(InvoiceItem),
      );

      const client = await clientRepository.save({ name: 'Test Client' });
      const user = await userRepository.save({
        email: 'test@example.com',
        username: 'testuser',
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
      invoiceItem = await invoiceItemRepository.save(
        InvoiceItemTestDataFactory.createValidInvoiceItemData({
          invoiceId: invoice.id,
          quantity: 1,
          description: 'Original Description',
        }),
      );
    });

    it('should update an existing invoice item', async () => {
      const updateData = {
        id: invoiceItem.id,
        quantity: 10,
        description: 'Updated Description',
        unitPrice: 50.0,
        lineTotal: 500.0,
        invoiceId: invoice.id,
      };

      await request(app.getHttpServer())
        .put('/invoice-items')
        .send(updateData)
        .expect(200);

      const invoiceItemRepository = app.get<Repository<InvoiceItem>>(
        getRepositoryToken(InvoiceItem),
      );
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
      const invoiceItemRepository = app.get<Repository<InvoiceItem>>(
        getRepositoryToken(InvoiceItem),
      );

      const client = await clientRepository.save({ name: 'Test Client' });
      const user = await userRepository.save({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        fullName: 'Test User',
        role: 'admin',
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
        }),
      );

      await request(app.getHttpServer())
        .delete(`/invoice-items/${item.id}`)
        .expect(200);

      const deletedItem = await invoiceItemRepository.findOneBy({
        id: item.id,
      });
      expect(deletedItem).toBeNull();
    });

    it('should return 404 for a non-existent invoice item ID', async () => {
      await request(app.getHttpServer())
        .delete('/invoice-items/99999')
        .expect(404);
    });
  });
});
