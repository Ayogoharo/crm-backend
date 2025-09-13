import { DataSource, QueryRunner } from 'typeorm';
import { TestDataSource } from '../../data-source';

export class TestDatabaseHelper {
  private static dataSource: DataSource;

  /**
   * Initialize the test database connection
   */
  static async initializeTestDatabase(): Promise<DataSource> {
    if (!this.dataSource) {
      this.dataSource = TestDataSource;

      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }
    }
    return this.dataSource;
  }

  /**
   * Clean up all tables for a fresh test state
   */
  static async cleanDatabase(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      // Get all table names
      const entities = this.dataSource.entityMetadatas;

      // Delete data in reverse dependency order to avoid foreign key constraint violations
      // Child tables first, then parent tables
      const tableOrder = [
        'invoice_items',
        'payments',
        'invoices',
        'leads',
        'clients',
        'users',
      ];

      // Delete from tables that exist in our entities
      for (const tableName of tableOrder) {
        const entity = entities.find((e) => e.tableName === tableName);
        if (entity) {
          await this.dataSource.query(`DELETE FROM "${tableName}"`);
        }
      }

      // Reset sequences for auto-incrementing IDs
      for (const entity of entities) {
        if (entity.primaryColumns.some((col) => col.isGenerated)) {
          await this.dataSource.query(
            `ALTER SEQUENCE IF EXISTS "${entity.tableName}_id_seq" RESTART WITH 1`,
          );
        }
      }
    }
  }

  /**
   * Close the test database connection
   */
  static async closeTestDatabase(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      // @ts-expect-error DataSource is not null after destroy
      this.dataSource = null;
    }
  }

  /**
   * Get the current test database connection
   */
  static getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * Start a transaction for test isolation
   */
  static async startTransaction() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  /**
   * Rollback transaction for test cleanup
   */
  static async rollbackTransaction(queryRunner: QueryRunner) {
    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }
}
