import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'uk');
  CREATE TABLE "cv_roles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cv_roles_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cv_education_locales" (
  	"title" varchar NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cv_skills_locales" (
  	"label" varchar NOT NULL,
  	"items" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cv_experience_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cv_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "cv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"website" varchar,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cv_locales" (
  	"name" varchar,
  	"location" varchar,
  	"about" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "cv_roles" ADD CONSTRAINT "cv_roles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_roles_locales" ADD CONSTRAINT "cv_roles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_education" ADD CONSTRAINT "cv_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_education_locales" ADD CONSTRAINT "cv_education_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_skills" ADD CONSTRAINT "cv_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_skills_locales" ADD CONSTRAINT "cv_skills_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_experience" ADD CONSTRAINT "cv_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_experience_locales" ADD CONSTRAINT "cv_experience_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv_experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv_links" ADD CONSTRAINT "cv_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cv" ADD CONSTRAINT "cv_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cv_locales" ADD CONSTRAINT "cv_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cv"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cv_roles_order_idx" ON "cv_roles" USING btree ("_order");
  CREATE INDEX "cv_roles_parent_id_idx" ON "cv_roles" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_roles_locales_locale_parent_id_unique" ON "cv_roles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_roles_locales_parent_id_idx" ON "cv_roles_locales" USING btree ("_parent_id");
  CREATE INDEX "cv_education_order_idx" ON "cv_education" USING btree ("_order");
  CREATE INDEX "cv_education_parent_id_idx" ON "cv_education" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_education_locales_locale_parent_id_unique" ON "cv_education_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_education_locales_parent_id_idx" ON "cv_education_locales" USING btree ("_parent_id");
  CREATE INDEX "cv_skills_order_idx" ON "cv_skills" USING btree ("_order");
  CREATE INDEX "cv_skills_parent_id_idx" ON "cv_skills" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_skills_locales_locale_parent_id_unique" ON "cv_skills_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_skills_locales_parent_id_idx" ON "cv_skills_locales" USING btree ("_parent_id");
  CREATE INDEX "cv_experience_order_idx" ON "cv_experience" USING btree ("_order");
  CREATE INDEX "cv_experience_parent_id_idx" ON "cv_experience" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cv_experience_locales_locale_parent_id_unique" ON "cv_experience_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_experience_locales_parent_id_idx" ON "cv_experience_locales" USING btree ("_parent_id");
  CREATE INDEX "cv_links_order_idx" ON "cv_links" USING btree ("_order");
  CREATE INDEX "cv_links_parent_id_idx" ON "cv_links" USING btree ("_parent_id");
  CREATE INDEX "cv_photo_idx" ON "cv" USING btree ("photo_id");
  CREATE UNIQUE INDEX "cv_locales_locale_parent_id_unique" ON "cv_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cv_locales_parent_id_idx" ON "cv_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cv_roles" CASCADE;
  DROP TABLE "cv_roles_locales" CASCADE;
  DROP TABLE "cv_education" CASCADE;
  DROP TABLE "cv_education_locales" CASCADE;
  DROP TABLE "cv_skills" CASCADE;
  DROP TABLE "cv_skills_locales" CASCADE;
  DROP TABLE "cv_experience" CASCADE;
  DROP TABLE "cv_experience_locales" CASCADE;
  DROP TABLE "cv_links" CASCADE;
  DROP TABLE "cv" CASCADE;
  DROP TABLE "cv_locales" CASCADE;
  DROP TYPE "public"."_locales";`)
}
