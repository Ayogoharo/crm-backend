import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TestDatabaseHelper } from '../src/clients/test-utils/test-database.helper';
import { InvoiceTestDataFactory } from '../src/invoices/test-utils/invoice-test-data.factory';
import { Client } from 'src/clients/entities/client.entity';
import { User } from 'src/users/entities/user.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';

describe('InvoicesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    await TestDatabaseHelper.initializeTestDatabase();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await TestDatabaseHelper.cleanDatabase();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await TestDatabaseHelper.closeTestDatabase();
  });

  describe('/invoices (POST)', () => {
    it('should create a new invoice and return its ID', async () => {
      // Arrange: Create a client and a user to associate with the invoice
      const dataSource = TestDatabaseHelper.getDataSource();
      const clientRepository: Repository<Client> =
        dataSource.getRepository(Client);
      const userRepository: Repository<User> = dataSource.getRepository(User);

      const client = await clientRepository.save({
        name: 'Test Client for Invoice',
      });

      const user = await userRepository.save({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        fullName: 'Test User',
        role: 'admin',
      });

      const invoiceData = InvoiceTestDataFactory.createValidInvoiceData({
        clientId: client.id,
        issuedBy: user.id,
      });

      // Act: Send the request to the server
      const response = await request(app.getHttpServer())
        .post('/invoices')
        .send(invoiceData)
        .expect(201);

      // Assert: Check the response and the database
      expect(response.body).toHaveProperty('id');
      const { id: invoiceId } = response.body as { id: number };

      const invoiceRepository: Repository<Invoice> =
        dataSource.getRepository(Invoice);
      const savedInvoice = await invoiceRepository.findOneBy({ id: invoiceId });

      expect(savedInvoice).not.toBeNull();
      expect(savedInvoice!.clientId).toBe(client.id);
      expect(savedInvoice!.issuedBy).toBe(user.id);
      expect(savedInvoice!.status).toBe(invoiceData.status);
    });
  });

  describe('/invoices (GET)', () => {
    it('should return a list of all invoices', async () => {
      // Arrange: Create a client, a user, and some invoices
      const dataSource = TestDatabaseHelper.getDataSource();
      const clientRepository: Repository<Client> =
        dataSource.getRepository(Client);
      const userRepository: Repository<User> = dataSource.getRepository(User);
      const invoiceRepository: Repository<Invoice> =
        dataSource.getRepository(Invoice);

      const client = await clientRepository.save({ name: 'Test Client' });
      const user = await userRepository.save({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
        fullName: 'Test User',
        role: 'admin',
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

      // Act
      const response = await request(app.getHttpServer())
        .get('/invoices')
        .expect(200);

      // Assert
      const { invoices } = response.body as { invoices: Invoice[] };
      expect(invoices).toBeInstanceOf(Array);
      expect(invoices.length).toBe(2);
    });

    it('should return a single invoice by ID', async () => {
      // Arrange
      const dataSource = TestDatabaseHelper.getDataSource();
      const clientRepository: Repository<Client> =
        dataSource.getRepository(Client);
      const userRepository: Repository<User> = dataSource.getRepository(User);
      const invoiceRepository: Repository<Invoice> =
        dataSource.getRepository(Invoice);

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
          totalAmount: 123.45,
        }),
      );

      // Act
      const response = await request(app.getHttpServer())
        .get(`/invoices/${invoice.id}`)
        .expect(200);

      // Assert
      const body = response.body as Invoice;
      expect(body.id).toBe(invoice.id);
      expect(body.totalAmount).toBe('123.45');
    });

    it('should return 404 for a non-existent invoice ID', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/invoices/99999').expect(404);
    });
  });

  describe('/invoices (PUT)', () => {
    it('should update an existing invoice', async () => {
      // Arrange
      const dataSource = TestDatabaseHelper.getDataSource();
      const clientRepository: Repository<Client> =
        dataSource.getRepository(Client);
      const userRepository: Repository<User> = dataSource.getRepository(User);
      const invoiceRepository: Repository<Invoice> =
        dataSource.getRepository(Invoice);

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
          status: 'draft',
        }),
      );

      const updateData = {
        id: invoice.id,
        status: 'sent',
        totalAmount: 500.0,
      };

      // Act
      await request(app.getHttpServer())
        .put('/invoices')
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
      // Arrange
      const dataSource = TestDatabaseHelper.getDataSource();
      const clientRepository: Repository<Client> =
        dataSource.getRepository(Client);
      const userRepository: Repository<User> = dataSource.getRepository(User);
      const invoiceRepository: Repository<Invoice> =
        dataSource.getRepository(Invoice);

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

      // Act
      await request(app.getHttpServer())
        .delete(`/invoices/${invoice.id}`)
        .expect(200);

      // Assert
      const deletedInvoice = await invoiceRepository.findOneBy({
        id: invoice.id,
      });
      expect(deletedInvoice).toBeNull();
    });

    it('should return 404 for a non-existent invoice ID', async () => {
      // Act & Assert
      await request(app.getHttpServer()).delete('/invoices/99999').expect(404);
    });
  });
});
