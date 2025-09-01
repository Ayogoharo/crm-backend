import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { faker } from '@faker-js/faker';
import { Client } from 'src/clients/entities/client.entity';

export class ClientSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const clientRepository = dataSource.getRepository(Client);

    // Check if clients already exist
    const existingClients = await clientRepository.count();
    if (existingClients > 0) {
      console.log('Clients already exist, skipping client seeding');
      return;
    }

    const createRandomClient = () => {
      return {
        name: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress({ useFullAddress: true }),
      };
    };

    const fakeClients = faker.helpers.multiple(createRandomClient, {
      count: 25,
    });

    const clients: Client[] = fakeClients.map((clientData) => {
      const client = new Client();
      Object.assign(client, clientData);
      return client;
    });

    await clientRepository.save(clients);
    console.log(`✅ Created ${clients.length} clients`);
  }
}
