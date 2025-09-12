import { TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { TestDatabaseHelper } from './test-utils/test-database.helper';
import { TestModuleHelper } from './test-utils/test-module.helper';
import { ClientTestDataFactory } from './test-utils/client-test-data.factory';
import { CreateClientBodyDto } from './dto/create-client-body.dto';
import { UpdateClientBodyDto } from './dto/update-client-body.dto';
import { User } from 'src/users/entities/user.entity';

describe('ClientsService Integration Tests', () => {
  let service: ClientsService;
  let repository: Repository<Client>;
  let module: TestingModule;

  beforeAll(async () => {
    // Initialize test database
    await TestDatabaseHelper.initializeTestDatabase();
  });

  beforeEach(async () => {
    // Create fresh testing module for each test
    const testModule = await TestModuleHelper.createTestingModule();
    module = testModule.module;
    service = testModule.service;
    repository = testModule.repository;

    // Clean database before each test
    await TestDatabaseHelper.cleanDatabase();
  });

  afterEach(async () => {
    // Close module after each test
    await TestModuleHelper.closeTestingModule(module);
  });

  afterAll(async () => {
    // Close test database connection
    await TestDatabaseHelper.closeTestDatabase();
  });

  describe('Database Connection', () => {
    it('should have a valid database connection', () => {
      expect(TestDatabaseHelper.getDataSource()).toBeDefined();
      expect(TestDatabaseHelper.getDataSource().isInitialized).toBe(true);
    });

    it('should have access to client repository', () => {
      expect(repository).toBeDefined();
      expect(repository.metadata.tableName).toBe('clients');
    });
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have access to repository', () => {
      expect(service).toHaveProperty('clientRepository');
    });
  });

  describe('CREATE Operations', () => {
    it('should create a new client with all fields', async () => {
      const clientData = ClientTestDataFactory.createValidClientData();

      const result = await service.create(clientData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('number');

      // Verify client was actually saved to database
      const savedClient = await repository.findOneBy({ id: result.id });
      expect(savedClient).toBeDefined();
      expect(savedClient?.name).toBe(clientData.name);
      expect(savedClient?.email).toBe(clientData.email);
      expect(savedClient?.phone).toBe(clientData.phone);
      expect(savedClient?.address).toBe(clientData.address);
      expect(savedClient?.createdAt).toBeDefined();
      expect(savedClient?.updatedAt).toBeDefined();
    });

    it('should create a client with minimal required fields', async () => {
      const clientData = ClientTestDataFactory.createMinimalClientData();

      const result = await service.create(clientData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      const savedClient = await repository.findOneBy({ id: result.id });
      expect(savedClient).toBeDefined();
      expect(savedClient?.name).toBe(clientData.name);
      expect(savedClient?.email).toBeNull();
      expect(savedClient?.phone).toBeNull();
      expect(savedClient?.address).toBeNull();
    });

    it('should create multiple clients successfully', async () => {
      const clientsData =
        ClientTestDataFactory.createMultipleValidClientData(3);
      const createdIds: number[] = [];

      for (const clientData of clientsData) {
        const result = await service.create(clientData);
        createdIds.push(result.id);
      }

      expect(createdIds).toHaveLength(3);
      expect(new Set(createdIds).size).toBe(3); // All IDs should be unique

      // Verify all clients exist in database
      const savedClients = await repository.findByIds(createdIds);
      expect(savedClients).toHaveLength(3);
    });
  });

  describe('READ Operations - findAll', () => {
    it('should return empty array when no clients exist', async () => {
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.clients).toEqual([]);
    });

    it('should return all clients when they exist', async () => {
      // Create test clients
      const clientsData = ClientTestDataFactory.createSearchTestClients();
      const createdIds: number[] = [];

      for (const clientData of clientsData) {
        const result = await service.create(clientData);
        createdIds.push(result.id);
      }

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.clients).toHaveLength(3);
      expect(
        result.clients.every((client) => createdIds.includes(client.id)),
      ).toBe(true);

      // Verify response structure
      result.clients.forEach((client) => {
        expect(client).toHaveProperty('id');
        expect(client).toHaveProperty('name');
        expect(client).toHaveProperty('email');
        expect(client).toHaveProperty('phone');
        expect(client).toHaveProperty('address');
        expect(client).toHaveProperty('createdAt');
        expect(client).toHaveProperty('updatedAt');
      });
    });
  });

  describe('READ Operations - findById', () => {
    let testClientId: number;

    beforeEach(async () => {
      const clientData = ClientTestDataFactory.createValidClientData();
      const result = await service.create(clientData);
      testClientId = result.id;
    });

    it('should find client by existing ID', async () => {
      const result = await service.findById(testClientId);

      expect(result).toBeDefined();
      expect(result.id).toBe(testClientId);
      expect(result.name).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw NotFoundException for non-existent ID', async () => {
      const nonExistentId = 99999;

      await expect(service.findById(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findById(nonExistentId)).rejects.toThrow(
        `Client with ID ${nonExistentId} not found`,
      );
    });
  });

  describe('UPDATE Operations', () => {
    let testClientId: number;
    let originalClientData: CreateClientBodyDto;

    beforeEach(async () => {
      originalClientData = ClientTestDataFactory.createValidClientData();
      const result = await service.create(originalClientData);
      testClientId = result.id;
    });

    afterEach(async () => {
      // TODO: Clean database after each test
    });

    it('should update client with all fields', async () => {
      const updateData =
        ClientTestDataFactory.createUpdateClientData(testClientId);

      const result = await service.update(testClientId, updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(testClientId);
      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(updateData.email);
      expect(result.phone).toBe(updateData.phone);
      expect(result.address).toBe(updateData.address);

      // Verify changes persisted to database
      const updatedClient = await repository.findOneBy({ id: testClientId });
      expect(updatedClient).toBeDefined();
      expect(updatedClient!.name).toBe(updateData.name);
      expect(updatedClient!.email).toBe(updateData.email);
      expect(updatedClient!.phone).toBe(updateData.phone);
      expect(updatedClient!.address).toBe(updateData.address);
      expect(updatedClient!.updatedAt.getTime()).toBeGreaterThan(
        updatedClient!.createdAt.getTime(),
      );
    });

    it('should update client with partial fields', async () => {
      const updateData: UpdateClientBodyDto = {
        id: testClientId,
        name: 'Updated Company Name',
        email: originalClientData.email,
        phone: originalClientData.phone,
        address: originalClientData.address,
      };

      const result = await service.update(testClientId, updateData);

      expect(result.name).toBe('Updated Company Name');
      expect(result.email).toBe(originalClientData.email);
      expect(result.phone).toBe(originalClientData.phone);
      expect(result.address).toBe(originalClientData.address);
    });

    it('should throw NotFoundException for non-existent client', async () => {
      const nonExistentId = 99999;
      const updateData =
        ClientTestDataFactory.createUpdateClientData(nonExistentId);

      await expect(service.update(nonExistentId, updateData)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(nonExistentId, updateData)).rejects.toThrow(
        `Client with ID ${nonExistentId} not found`,
      );
    });
  });

  describe('DELETE Operations', () => {
    let testClientId: number;

    beforeEach(async () => {
      const clientData = ClientTestDataFactory.createValidClientData();
      const result = await service.create(clientData);
      testClientId = result.id;
    });

    it('should delete existing client', async () => {
      // Verify client exists before deletion
      const clientBeforeDelete = await repository.findOneBy({
        id: testClientId,
      });
      expect(clientBeforeDelete).toBeDefined();

      await service.delete(testClientId);

      // Verify client no longer exists
      const clientAfterDelete = await repository.findOneBy({
        id: testClientId,
      });
      expect(clientAfterDelete).toBeNull();
    });

    it('should throw NotFoundException for non-existent client', async () => {
      const nonExistentId = 99999;

      await expect(service.delete(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete(nonExistentId)).rejects.toThrow(
        `Client with ID ${nonExistentId} not found`,
      );
    });

    it('should not affect other clients when deleting one', async () => {
      // Create additional clients
      const otherClientsData =
        ClientTestDataFactory.createMultipleValidClientData(2);
      const otherClientIds: number[] = [];

      for (const clientData of otherClientsData) {
        const result = await service.create(clientData);
        otherClientIds.push(result.id);
      }

      // Delete the test client
      await service.delete(testClientId);

      // Verify other clients still exist
      const remainingClients = await repository.findByIds(otherClientIds);
      expect(remainingClients).toHaveLength(2);

      // Verify deleted client is gone
      const deletedClient = await repository.findOneBy({ id: testClientId });
      expect(deletedClient).toBeNull();
    });
  });

  describe('getClientInvoiceTotal Operations', () => {
    let testClientId: number;
    let testUser: User;

    beforeEach(async () => {
      // Create a user to act as the invoice issuer
      const userRepository =
        TestDatabaseHelper.getDataSource().getRepository(User);
      testUser = await userRepository.save({
        email: 'test-issuer@example.com',
        username: 'test-issuer',
        password: 'password',
        fullName: 'Test Issuer',
        role: 'admin',
      });

      const clientData = ClientTestDataFactory.createValidClientData();
      const result = await service.create(clientData);
      testClientId = result.id;
    });

    it('should return zero total for client with no invoices', async () => {
      const result = await service.getClientInvoiceTotal(testClientId);

      expect(result).toBeDefined();
      expect(result.clientId).toBe(testClientId);
      expect(result.total).toBe(0);
    });

    it('should throw NotFoundException for non-existent client', async () => {
      const nonExistentId = 99999;

      await expect(
        service.getClientInvoiceTotal(nonExistentId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getClientInvoiceTotal(nonExistentId),
      ).rejects.toThrow(`Client with ID ${nonExistentId} not found`);
    });

    it('should calculate total correctly with single invoice', async () => {
      // Create an invoice for the client directly in the database
      const invoiceData = {
        client: { id: testClientId },
        issuedBy: { id: testUser.id }, // Assuming user with ID 1 exists
        invoiceNumber: 'INV-001',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'pending',
        totalAmount: 1500.0,
        notes: 'Test invoice',
      };

      const invoiceRepository =
        TestDatabaseHelper.getDataSource().getRepository('Invoice');
      await invoiceRepository.save(invoiceData);

      const result = await service.getClientInvoiceTotal(testClientId);

      expect(result.clientId).toBe(testClientId);
      expect(result.total).toBe(1500.0);
    });

    it('should calculate total correctly with multiple invoices', async () => {
      // Create multiple invoices for the client
      const invoiceRepository =
        TestDatabaseHelper.getDataSource().getRepository('Invoice');

      const invoicesData = [
        {
          client: { id: testClientId },
          issuedBy: { id: testUser.id },
          invoiceNumber: 'INV-001',
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending',
          totalAmount: 1000.0,
          notes: 'First invoice',
        },
        {
          client: { id: testClientId },
          issuedBy: { id: testUser.id },
          invoiceNumber: 'INV-002',
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'paid',
          totalAmount: 2500.5,
          notes: 'Second invoice',
        },
        {
          client: { id: testClientId },
          issuedBy: { id: testUser.id },
          invoiceNumber: 'INV-003',
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'overdue',
          totalAmount: 750.25,
          notes: 'Third invoice',
        },
      ];

      for (const invoiceData of invoicesData) {
        await invoiceRepository.save(invoiceData);
      }

      const result = await service.getClientInvoiceTotal(testClientId);

      expect(result.clientId).toBe(testClientId);
      expect(result.total).toBe(4250.75); // 1000 + 2500.50 + 750.25
    });

    it('should handle decimal precision correctly', async () => {
      const invoiceRepository =
        TestDatabaseHelper.getDataSource().getRepository('Invoice');

      const invoiceData = {
        client: { id: testClientId },
        issuedBy: { id: testUser.id },
        invoiceNumber: 'INV-DECIMAL',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
        totalAmount: 123.456789, // Test decimal precision
        notes: 'Decimal test invoice',
      };

      await invoiceRepository.save(invoiceData);

      const result = await service.getClientInvoiceTotal(testClientId);

      expect(result.clientId).toBe(testClientId);
      expect(result.total).toBeCloseTo(123.46, 2); // Should round to 2 decimal places
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test verifies that service methods handle database errors properly
      const invalidClientData = ClientTestDataFactory.createValidClientData();

      // Test with extremely long name that exceeds database constraints
      invalidClientData.name = 'a'.repeat(1000);

      await expect(service.create(invalidClientData)).rejects.toThrow();
    });

    it('should handle concurrent operations correctly', async () => {
      const clientData = ClientTestDataFactory.createValidClientData();

      // Create multiple clients concurrently
      const createPromises = Array.from({ length: 5 }, () =>
        service.create({
          ...clientData,
          name: `${clientData.name}-${Math.random()}`,
        }),
      );

      const results = await Promise.all(createPromises);

      // All should succeed and have unique IDs
      expect(results).toHaveLength(5);
      const ids = results.map((r) => r.id);
      expect(new Set(ids).size).toBe(5);

      // Verify all clients exist in database
      const savedClients = await repository.findByIds(ids);
      expect(savedClients).toHaveLength(5);
    });

    it('should maintain data integrity during transactions', async () => {
      const clientData = ClientTestDataFactory.createValidClientData();
      const result = await service.create(clientData);
      const clientId = result.id;

      // Verify client exists
      const clientBefore = await repository.findOneBy({ id: clientId });
      expect(clientBefore).toBeDefined();

      // Update and verify atomicity
      const updateData = ClientTestDataFactory.createUpdateClientData(clientId);
      const updatedClient = await service.update(clientId, updateData);

      expect(updatedClient.name).toBe(updateData.name);

      // Verify changes are immediately visible
      const clientAfter = await repository.findOneBy({ id: clientId });
      expect(clientAfter?.name).toBe(updateData.name);
    });

    it('should handle empty database state correctly', async () => {
      // Ensure database is clean
      await TestDatabaseHelper.cleanDatabase();

      const result = await service.findAll();
      expect(result.clients).toEqual([]);

      // Test operations on empty database
      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
      await expect(service.getClientInvoiceTotal(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate input data types correctly', async () => {
      // Test with invalid ID types (string instead of number)
      await expect(service.findById(NaN)).rejects.toThrow();
      await expect(service.delete(NaN)).rejects.toThrow();
      await expect(service.getClientInvoiceTotal(NaN)).rejects.toThrow();
    });

    it('should handle large datasets efficiently', async () => {
      // Create a large number of clients
      const clientsData =
        ClientTestDataFactory.createMultipleValidClientData(50);
      const createdIds: number[] = [];

      // Measure creation time
      const startTime = Date.now();

      for (const clientData of clientsData) {
        const result = await service.create(clientData);
        createdIds.push(result.id);
      }

      const creationTime = Date.now() - startTime;

      // Verify all clients were created
      expect(createdIds).toHaveLength(50);

      // Test findAll performance with large dataset
      const findAllStart = Date.now();
      const allClients = await service.findAll();
      const findAllTime = Date.now() - findAllStart;

      expect(allClients.clients).toHaveLength(50);

      // Performance should be reasonable (adjust thresholds as needed)
      expect(creationTime).toBeLessThan(10000); // 10 seconds
      expect(findAllTime).toBeLessThan(1000); // 1 second
    });

    it('should handle special characters in client data', async () => {
      const specialCharacterData = {
        name: 'Café & Restaurant "L\'Étoile" <Special>',
        email: 'test+special@domain-name.co.uk',
        phone: '+1 (555) 123-4567 ext. 890',
        address: '123 Main St., Apt #4B\nSecond Line\tTabbed',
      };

      const result = await service.create(specialCharacterData);
      expect(result.id).toBeDefined();

      const savedClient = await repository.findOneBy({ id: result.id });
      expect(savedClient?.name).toBe(specialCharacterData.name);
      expect(savedClient?.email).toBe(specialCharacterData.email);
      expect(savedClient?.phone).toBe(specialCharacterData.phone);
      expect(savedClient?.address).toBe(specialCharacterData.address);
    });
  });
});
