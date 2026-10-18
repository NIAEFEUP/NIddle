import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1792320838915 implements MigrationInterface {
  name = "InitialSchema1792320838915";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "faculty" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "acronym" character varying NOT NULL, CONSTRAINT "PK_635ca3484f9c747b6635a494ad9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "acronym" character varying NOT NULL, CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "year" integer NOT NULL, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "facultyId" uuid, "createdById" uuid NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "schedule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "dayOfWeek" character varying NOT NULL DEFAULT 'Monday', "serviceId" uuid, CONSTRAINT "PK_1c05e42aec7371641193e180046" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying, "location" character varying, "phoneNumber" character varying, "facultyId" uuid, "courseId" uuid, "createdById" uuid NOT NULL, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."request_action_enum" AS ENUM('Create', 'Update Existing', 'Delete Existing')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."request_type_enum" AS ENUM('Service', 'Event')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."request_status_enum" AS ENUM('Pending', 'Approved', 'Rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" "public"."request_action_enum" NOT NULL, "type" "public"."request_type_enum" NOT NULL, "status" "public"."request_status_enum" NOT NULL DEFAULT 'Pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "reviewedAt" TIMESTAMP, "rejectionReason" character varying, "payload" text, "requestedById" uuid, "targetEventId" uuid, "targetServiceId" uuid, "targetAssociationId" uuid NOT NULL, CONSTRAINT "PK_167d324701e6867f189aed52e18" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "association" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "acronym" character varying, CONSTRAINT "PK_5c770cfef7a1f66da23be411699" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "faculty_courses_course" ("facultyId" uuid NOT NULL, "courseId" uuid NOT NULL, CONSTRAINT "PK_6607d9ddd989a90f3ecbe6a86fb" PRIMARY KEY ("facultyId", "courseId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57a7d103a12fcc0bb891768b27" ON "faculty_courses_course" ("facultyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_61995448619ba1bdcaefcebf05" ON "faculty_courses_course" ("courseId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_courses_course" ("eventId" uuid NOT NULL, "courseId" uuid NOT NULL, CONSTRAINT "PK_16befba6de57caaab6598dd2765" PRIMARY KEY ("eventId", "courseId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae4c5e859544190e08fd7de149" ON "event_courses_course" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6c27c32b489e33f53c0b2b1471" ON "event_courses_course" ("courseId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "association_users_user" ("associationId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_8109b619912b0fe0c5946a68eec" PRIMARY KEY ("associationId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_26b9ccf6b8ad1765ea4ea64e18" ON "association_users_user" ("associationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_43f9cad9b4c9408efc74f718ee" ON "association_users_user" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_1adf3b8c89d45c906b3de448f45" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_1d5a6b5f38273d74f192ae552a6" FOREIGN KEY ("createdById") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule" ADD CONSTRAINT "FK_69e3d56034fdd8618e2133a1aab" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_f46ea00a2070326d1fe1be07e3a" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_bd43729518f25a1f1a08be5d966" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_87cf55c0575ef49843d7bf29397" FOREIGN KEY ("createdById") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" ADD CONSTRAINT "FK_b6307fe057bf6559fe4cb048431" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" ADD CONSTRAINT "FK_4ae12a1ca717e8a472dc377eba1" FOREIGN KEY ("targetEventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" ADD CONSTRAINT "FK_dd152a1d3879c35ce7d6d7350ce" FOREIGN KEY ("targetServiceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" ADD CONSTRAINT "FK_e57266428f86dba372905272641" FOREIGN KEY ("targetAssociationId") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "faculty_courses_course" ADD CONSTRAINT "FK_57a7d103a12fcc0bb891768b27d" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "faculty_courses_course" ADD CONSTRAINT "FK_61995448619ba1bdcaefcebf05f" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_courses_course" ADD CONSTRAINT "FK_ae4c5e859544190e08fd7de1495" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_courses_course" ADD CONSTRAINT "FK_6c27c32b489e33f53c0b2b14714" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "association_users_user" ADD CONSTRAINT "FK_26b9ccf6b8ad1765ea4ea64e186" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "association_users_user" ADD CONSTRAINT "FK_43f9cad9b4c9408efc74f718ee9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "association_users_user" DROP CONSTRAINT "FK_43f9cad9b4c9408efc74f718ee9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "association_users_user" DROP CONSTRAINT "FK_26b9ccf6b8ad1765ea4ea64e186"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_courses_course" DROP CONSTRAINT "FK_6c27c32b489e33f53c0b2b14714"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_courses_course" DROP CONSTRAINT "FK_ae4c5e859544190e08fd7de1495"`,
    );
    await queryRunner.query(
      `ALTER TABLE "faculty_courses_course" DROP CONSTRAINT "FK_61995448619ba1bdcaefcebf05f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "faculty_courses_course" DROP CONSTRAINT "FK_57a7d103a12fcc0bb891768b27d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" DROP CONSTRAINT "FK_e57266428f86dba372905272641"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" DROP CONSTRAINT "FK_dd152a1d3879c35ce7d6d7350ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" DROP CONSTRAINT "FK_4ae12a1ca717e8a472dc377eba1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request" DROP CONSTRAINT "FK_b6307fe057bf6559fe4cb048431"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_87cf55c0575ef49843d7bf29397"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_bd43729518f25a1f1a08be5d966"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_f46ea00a2070326d1fe1be07e3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule" DROP CONSTRAINT "FK_69e3d56034fdd8618e2133a1aab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_1d5a6b5f38273d74f192ae552a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_1adf3b8c89d45c906b3de448f45"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_43f9cad9b4c9408efc74f718ee"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_26b9ccf6b8ad1765ea4ea64e18"`,
    );
    await queryRunner.query(`DROP TABLE "association_users_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6c27c32b489e33f53c0b2b1471"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae4c5e859544190e08fd7de149"`,
    );
    await queryRunner.query(`DROP TABLE "event_courses_course"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_61995448619ba1bdcaefcebf05"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57a7d103a12fcc0bb891768b27"`,
    );
    await queryRunner.query(`DROP TABLE "faculty_courses_course"`);
    await queryRunner.query(`DROP TABLE "association"`);
    await queryRunner.query(`DROP TABLE "request"`);
    await queryRunner.query(`DROP TYPE "public"."request_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."request_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."request_action_enum"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "service"`);
    await queryRunner.query(`DROP TABLE "schedule"`);
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP TABLE "course"`);
    await queryRunner.query(`DROP TABLE "faculty"`);
  }
}
