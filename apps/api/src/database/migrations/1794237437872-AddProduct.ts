import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProduct1794237437872 implements MigrationInterface {
  name = "AddProduct1794237437872";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "slogan" character varying, "targetAudience" character varying, "links" text, "image" character varying, "thumbnail" character varying, "isArchived" boolean NOT NULL DEFAULT false, "gallery" text, "createdById" uuid NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_806302f2d4da2a0c27eedbf34fe" FOREIGN KEY ("createdById") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_806302f2d4da2a0c27eedbf34fe"`,
    );
    await queryRunner.query(`DROP TABLE "product"`);
  }
}
