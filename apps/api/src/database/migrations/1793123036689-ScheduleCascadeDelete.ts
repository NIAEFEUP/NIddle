import type { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleCascadeDelete1793123036689 implements MigrationInterface {
  name = "ScheduleCascadeDelete1793123036689";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Slots orphaned by earlier schedule updates have no service and are unreachable.
    await queryRunner.query(`DELETE FROM "schedule" WHERE "serviceId" IS NULL`);
    await queryRunner.query(
      `ALTER TABLE "schedule" DROP CONSTRAINT "FK_69e3d56034fdd8618e2133a1aab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule" ADD CONSTRAINT "FK_69e3d56034fdd8618e2133a1aab" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "schedule" DROP CONSTRAINT "FK_69e3d56034fdd8618e2133a1aab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule" ADD CONSTRAINT "FK_69e3d56034fdd8618e2133a1aab" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
