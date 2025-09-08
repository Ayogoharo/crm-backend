import 'reflect-metadata';
import { TestDataSource } from '../data-source';

async function runMigrations() {
  try {
    console.log('🔌 Connecting to test database...');
    await TestDataSource.initialize();

    console.log('🚀 Running migrations for test database...');
    await TestDataSource.runMigrations();

    console.log('✅ Test database migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(
      '❌ Test database migration failed:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  } finally {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
  }
}

void runMigrations();
