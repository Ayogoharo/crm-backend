import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1756396888643 implements MigrationInterface {
  name = 'InitialMigration1756396888643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying(255) NOT NULL,
        "username" character varying(100) NOT NULL,
        "password_hash" text NOT NULL,
        "full_name" character varying(255) NOT NULL,
        "role" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_users_role" CHECK ("role" IN ('admin', 'sales', 'accountant'))
      )
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" SERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "email" character varying(255),
        "phone" character varying(50),
        "address" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id")
      )
    `);

    // Create leads table
    await queryRunner.query(`
      CREATE TABLE "leads" (
        "id" SERIAL NOT NULL,
        "client_id" integer NOT NULL,
        "owner_id" integer NOT NULL,
        "status" character varying(50) NOT NULL,
        "source" character varying(100),
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_3b6b3b7b7b7b7b7b7b7b7b7b7" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_leads_status" CHECK ("status" IN ('new', 'contacted', 'qualified', 'won', 'lost'))
      )
    `);

    // Create invoices table
    await queryRunner.query(`
      CREATE TABLE "invoices" (
        "id" SERIAL NOT NULL,
        "client_id" integer NOT NULL,
        "issued_by" integer NOT NULL,
        "invoice_date" date NOT NULL,
        "due_date" date NOT NULL,
        "status" character varying(50) NOT NULL,
        "total_amount" numeric(12,2) NOT NULL DEFAULT '0',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_invoices_status" CHECK ("status" IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'))
      )
    `);

    // Create invoice_items table
    await queryRunner.query(`
      CREATE TABLE "invoice_items" (
        "id" SERIAL NOT NULL,
        "invoice_id" integer NOT NULL,
        "description" text NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(12,2) NOT NULL,
        "line_total" numeric(12,2) NOT NULL,
        CONSTRAINT "PK_62d9b6b4e7b7b7b7b7b7b7b7b" PRIMARY KEY ("id")
      )
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" SERIAL NOT NULL,
        "invoice_id" integer NOT NULL,
        "recorded_by" integer,
        "payment_date" date NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "method" character varying(50) NOT NULL,
        "reference" character varying(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_payments_method" CHECK ("method" IN ('cash', 'bank_transfer', 'credit_card', 'paypal'))
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_client_id" 
      FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_owner_id" 
      FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_client_id" 
      FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_issued_by" 
      FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_invoice_items_invoice_id" 
      FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_invoice_id" 
      FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_recorded_by" 
      FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_leads_client_id" ON "leads" ("client_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leads_owner_id" ON "leads" ("owner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leads_status" ON "leads" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_invoices_client_id" ON "invoices" ("client_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_invoices_issued_by" ON "invoices" ("issued_by")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_invoices_status" ON "invoices" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_invoice_items_invoice_id" ON "invoice_items" ("invoice_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payments_invoice_id" ON "payments" ("invoice_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payments_recorded_by" ON "payments" ("recorded_by")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_payments_recorded_by"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_invoice_id"`);
    await queryRunner.query(`DROP INDEX "IDX_invoice_items_invoice_id"`);
    await queryRunner.query(`DROP INDEX "IDX_invoices_status"`);
    await queryRunner.query(`DROP INDEX "IDX_invoices_issued_by"`);
    await queryRunner.query(`DROP INDEX "IDX_invoices_client_id"`);
    await queryRunner.query(`DROP INDEX "IDX_leads_status"`);
    await queryRunner.query(`DROP INDEX "IDX_leads_owner_id"`);
    await queryRunner.query(`DROP INDEX "IDX_leads_client_id"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_recorded_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_invoice_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_invoice_items_invoice_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_issued_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_client_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_owner_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_client_id"`,
    );

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "invoice_items"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TABLE "leads"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
