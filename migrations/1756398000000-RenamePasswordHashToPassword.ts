import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePasswordHashToPassword1756398000000
  implements MigrationInterface
{
  name = 'RenamePasswordHashToPassword1756398000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename password_hash column to password and change type from text to varchar(255)
    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "password_hash" TO "password"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "password" TYPE character varying(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert password column back to password_hash and change type back to text
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "password" TYPE text
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      RENAME COLUMN "password" TO "password_hash"
    `);
  }
}
