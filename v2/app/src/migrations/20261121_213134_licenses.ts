import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_licenses_status" AS ENUM('active', 'revoked');
  CREATE TABLE "licenses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"txn" varchar NOT NULL,
  	"product" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"licence" varchar NOT NULL,
  	"status" "enum_licenses_status" DEFAULT 'active' NOT NULL,
  	"paddle_customer_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "license_revocations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"revoked_json" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "licenses_id" integer;
  CREATE UNIQUE INDEX "licenses_txn_idx" ON "licenses" USING btree ("txn");
  CREATE INDEX "licenses_updated_at_idx" ON "licenses" USING btree ("updated_at");
  CREATE INDEX "licenses_created_at_idx" ON "licenses" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_licenses_fk" FOREIGN KEY ("licenses_id") REFERENCES "public"."licenses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_licenses_id_idx" ON "payload_locked_documents_rels" USING btree ("licenses_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "licenses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "license_revocations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "licenses" CASCADE;
  DROP TABLE "license_revocations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_licenses_fk";
  
  DROP INDEX "payload_locked_documents_rels_licenses_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "licenses_id";
  DROP TYPE "public"."enum_licenses_status";`)
}
