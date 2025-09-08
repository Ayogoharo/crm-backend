import 'reflect-metadata';
import { runAllSeeders } from './index';
import { TestDataSource } from '../../../data-source';

async function main() {
  try {
    console.log('🔌 Connecting to test database...');
    await TestDataSource.initialize();

    console.log('🌱 Running test database seeders...');
    await runAllSeeders(TestDataSource);

    console.log('✅ Test seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(
      '❌ Test seeding failed:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  } finally {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
  }
}

void main();
