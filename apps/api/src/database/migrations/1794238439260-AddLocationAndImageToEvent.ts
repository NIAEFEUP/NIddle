import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationAndImageToEvent1794238439260
  implements MigrationInterface
{
  name = "AddLocationAndImageToEvent1794238439260";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event" ADD "location" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD "image" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "image"`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "location"`);
  }
}
