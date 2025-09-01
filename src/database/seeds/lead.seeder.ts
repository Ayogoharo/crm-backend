import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { faker } from '@faker-js/faker';
import { Lead } from 'src/leads/entities/lead.entity';
import { Client } from 'src/clients/entities/client.entity';
import { User } from 'src/users/entities/user.entity';

const LeadStatus = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  WON: 'won',
  LOST: 'lost',
} as const;

export class LeadSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const leadRepository = dataSource.getRepository(Lead);
    const clientRepository = dataSource.getRepository(Client);
    const userRepository = dataSource.getRepository(User);

    // Check if leads already exist
    const existingLeads = await leadRepository.count();
    if (existingLeads > 0) {
      console.log('Leads already exist, skipping lead seeding');
      return;
    }

    // Get existing clients and users for relationships
    const clients = await clientRepository.find();
    const users = await userRepository.find();

    if (clients.length === 0 || users.length === 0) {
      console.log(
        '❌ Cannot create leads: clients or users not found. Run client and user seeders first.',
      );
      return;
    }

    const leadSources = [
      'Website',
      'Social Media',
      'Referral',
      'Cold Call',
      'Email Campaign',
      'Trade Show',
      'Advertisement',
      'Partner',
    ];

    const createRandomLead = () => {
      const client = faker.helpers.arrayElement(clients);
      const owner = faker.helpers.arrayElement(users);

      return {
        clientId: client.id,
        ownerId: owner.id,
        status: faker.helpers.enumValue(LeadStatus),
        source: faker.helpers.arrayElement(leadSources),
        notes: faker.lorem.paragraph(),
      };
    };

    const fakeLeads = faker.helpers.multiple(createRandomLead, {
      count: 50,
    });

    const leads: Lead[] = fakeLeads.map((leadData) => {
      const lead = new Lead();
      Object.assign(lead, leadData);
      return lead;
    });

    await leadRepository.save(leads);
    console.log(`✅ Created ${leads.length} leads`);
  }
}
