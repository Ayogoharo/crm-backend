import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/entities/user.entity';

/**
 * Test authentication helpers for e2e tests
 * These functions create test users and login tokens for different roles
 */

export interface TestAuthResult {
  token: string;
  user: User;
}

/**
 * Creates a test user with the specified role and returns a JWT token
 */
async function createUserAndLogin(
  app: INestApplication,
  role: 'admin' | 'sales' | 'accountant',
  emailSuffix: string = '',
): Promise<TestAuthResult> {
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  // Create unique test user data
  const timestamp = Date.now();
  const email = `test-${role}${emailSuffix}-${timestamp}@example.com`;
  const username = `test${role}${emailSuffix}${timestamp}`;

  // Create user directly in database using proper User entity
  const plainPassword = 'Test123456!';
  const user = new User();
  user.email = email;
  user.username = username;
  user.password = plainPassword; // Will be hashed by entity hooks
  user.fullName = `Test ${role.charAt(0).toUpperCase() + role.slice(1)} User`;
  user.role = role;

  const savedUser = await userRepository.save(user);

  // Login to get JWT token using the plain password
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: savedUser.email,
      password: plainPassword, // Use original plain password
    })
    .expect(201);

  return {
    token: loginResponse.body.access_token,
    user: savedUser,
  };
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(
  app: INestApplication,
): Promise<TestAuthResult> {
  return createUserAndLogin(app, 'admin');
}

/**
 * Login as sales user
 */
export async function loginAsSales(
  app: INestApplication,
): Promise<TestAuthResult> {
  return createUserAndLogin(app, 'sales');
}

/**
 * Login as accountant user
 */
export async function loginAsAccountant(
  app: INestApplication,
): Promise<TestAuthResult> {
  return createUserAndLogin(app, 'accountant');
}

/**
 * Helper to create multiple users for testing role-based access
 */
export async function createTestUsers(app: INestApplication) {
  const admin = await loginAsAdmin(app);
  const sales = await loginAsSales(app);
  const accountant = await loginAsAccountant(app);

  return {
    admin,
    sales,
    accountant,
  };
}

/**
 * Helper to add Authorization header to supertest request
 */
export function withAuth(request: any, token: string) {
  return request.set('Authorization', `Bearer ${token}`);
}
