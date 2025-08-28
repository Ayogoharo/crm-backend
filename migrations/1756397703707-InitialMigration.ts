import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1756397703707 implements MigrationInterface {
    name = 'InitialMigration1756397703707'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_invoice_items_invoice_id"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_invoice_id"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_recorded_by"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_client_id"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_issued_by"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_owner_id"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_client_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invoice_items_invoice_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payments_invoice_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payments_recorded_by"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invoices_client_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invoices_issued_by"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invoices_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_leads_client_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_leads_owner_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_leads_status"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_users_role"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "CHK_payments_method"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "CHK_invoices_status"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "CHK_leads_status"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_dc991d555664682cfe892eea2c1" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_563a5e248518c623eebd987d43e" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b8128ab843771cf6d42ab3ca188" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_5534ba11e10f1a9953cbdaabf16" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_583c9037bc0cbe84ab512a33580" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_15ec158ab4d5628c673419d4ade" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_4e1b2fdccce9cf66bcd9c6d2492" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_4e1b2fdccce9cf66bcd9c6d2492"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_15ec158ab4d5628c673419d4ade"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_583c9037bc0cbe84ab512a33580"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_5534ba11e10f1a9953cbdaabf16"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b8128ab843771cf6d42ab3ca188"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_563a5e248518c623eebd987d43e"`);
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_dc991d555664682cfe892eea2c1"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "CHK_leads_status" CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'contacted'::character varying, 'qualified'::character varying, 'won'::character varying, 'lost'::character varying])::text[])))`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "CHK_invoices_status" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'sent'::character varying, 'paid'::character varying, 'overdue'::character varying, 'cancelled'::character varying])::text[])))`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "CHK_payments_method" CHECK (((method)::text = ANY ((ARRAY['cash'::character varying, 'bank_transfer'::character varying, 'credit_card'::character varying, 'paypal'::character varying])::text[])))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_role" CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'sales'::character varying, 'accountant'::character varying])::text[])))`);
        await queryRunner.query(`CREATE INDEX "IDX_leads_status" ON "leads" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_leads_owner_id" ON "leads" ("owner_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_leads_client_id" ON "leads" ("client_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_invoices_status" ON "invoices" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_invoices_issued_by" ON "invoices" ("issued_by") `);
        await queryRunner.query(`CREATE INDEX "IDX_invoices_client_id" ON "invoices" ("client_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_payments_recorded_by" ON "payments" ("recorded_by") `);
        await queryRunner.query(`CREATE INDEX "IDX_payments_invoice_id" ON "payments" ("invoice_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_invoice_items_invoice_id" ON "invoice_items" ("invoice_id") `);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_issued_by" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_recorded_by" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_invoice_items_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
