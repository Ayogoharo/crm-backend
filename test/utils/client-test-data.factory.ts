import { faker } from '@faker-js/faker';
import { CreateClientBodyDto } from '../../src/clients/dto/create-client-body.dto';
import { UpdateClientBodyDto } from '../../src/clients/dto/update-client-body.dto';
import { Client } from '../../src/clients/entities/client.entity';

export class ClientTestDataFactory {
  /**
   * Create a valid client data object for testing
   */
  static createValidClientData(
    overrides: Partial<CreateClientBodyDto> = {},
  ): CreateClientBodyDto {
    return {
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      ...overrides,
    };
  }

  /**
   * Create multiple valid client data objects
   */
  static createMultipleValidClientData(count: number): CreateClientBodyDto[] {
    return Array.from({ length: count }, () => this.createValidClientData());
  }

  /**
   * Create client data with minimal required fields only
   */
  static createMinimalClientData(
    overrides: Partial<CreateClientBodyDto> = {},
  ): CreateClientBodyDto {
    return {
      name: faker.company.name(),
      ...overrides,
    };
  }

  /**
   * Create update client data
   */
  static createUpdateClientData(
    id: number,
    overrides: Partial<UpdateClientBodyDto> = {},
  ): UpdateClientBodyDto {
    return {
      id,
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      ...overrides,
    };
  }

  /**
   * Create client data with invalid fields for testing validation
   */
  static createInvalidClientData(): Partial<CreateClientBodyDto> {
    return {
      name: '', // Invalid: empty name
      email: 'invalid-email', // Invalid: malformed email
      phone: 'a'.repeat(100), // Invalid: too long phone
      address: 'a'.repeat(1000), // Invalid: too long address
    };
  }

  /**
   * Create a client entity for direct database operations
   */
  static createClientEntity(overrides: Partial<Client> = {}): Partial<Client> {
    return {
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress({ useFullAddress: true }),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Create test clients with specific patterns for search testing
   */
  static createSearchTestClients(): CreateClientBodyDto[] {
    return [
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0001',
        address: '123 Main St, New York, NY',
      },
      {
        name: 'Beta Solutions',
        email: 'info@beta.com',
        phone: '+1-555-0002',
        address: '456 Oak Ave, Los Angeles, CA',
      },
      {
        name: 'Gamma Industries',
        email: 'hello@gamma.com',
        phone: '+1-555-0003',
        address: '789 Pine Rd, Chicago, IL',
      },
    ];
  }
}
