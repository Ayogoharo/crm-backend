import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { faker } from '@faker-js/faker';
import { User } from 'src/users/entities/user.entity';

const UserRole = {
  ADMIN: 'admin',
  SALES: 'sales',
  ACCOUNTANT: 'accountant',
} as const;

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Check if users already exist
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping user seeding');
      return;
    }

    const createRandomUser = () => {
      return {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password: faker.internet.password({ length: 12 }),
        fullName: faker.person.fullName(),
        role: faker.helpers.enumValue(UserRole),
      };
    };

    const fakeUsers = faker.helpers.multiple(createRandomUser, {
      count: 10,
    });

    const users: User[] = fakeUsers.map((userData) => {
      const user = new User();
      Object.assign(user, userData);
      return user;
    });

    await userRepository.save(users);
    console.log(`✅ Created ${users.length} users`);
  }
}
