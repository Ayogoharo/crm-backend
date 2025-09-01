import 'reflect-metadata';
import { runAllSeeders } from './index';
import { AppDataSource } from '../../../data-source';

async function main() {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();

    console.log('🌱 Running database seeders...');
    await runAllSeeders(AppDataSource);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(
      '❌ Seeding failed:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void main();
