import { faker } from '@faker-js/faker';
import { CreateUserBodyDto } from '../dto/create-user-body.dto';

export class UserTestDataFactory {
  static createValidUserData(
    overrides: Partial<CreateUserBodyDto> = {},
  ): CreateUserBodyDto {
    return {
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 10 }),
      fullName: faker.person.fullName(),
      role: 'admin',
      ...overrides,
    };
  }
}
