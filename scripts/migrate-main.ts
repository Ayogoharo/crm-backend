import 'reflect-metadata';
import { AppDataSource } from '../data-source';

async function runMigrations() {
  try {
    console.log('🔌 Connecting to main database...');
    await AppDataSource.initialize();

    console.log('🚀 Running migrations for main database...');
    await AppDataSource.runMigrations();

    console.log('✅ Main database migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(
      '❌ Main database migration failed:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runMigrations();
