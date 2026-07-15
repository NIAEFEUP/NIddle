import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders, SeederOptions } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { requiredEnv } from "./helpers/required-env";

if (process.env.NODE_ENV !== "test") {
  config({ path: ".env.local" });
}

export const seed = async () => {
  const options: DataSourceOptions & SeederOptions = {
    type: "postgres",
    host: requiredEnv("DATABASE_MASTER"),
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    username: requiredEnv("DATABASE_USER"),
    password: requiredEnv("DATABASE_PASSWORD"),
    database: requiredEnv("DATABASE_NAME"),
    synchronize: true,
    dropSchema: true,
    schema: "public",
    entities: [Association, Course, Faculty, User, Service, Schedule, Event],
    seeds: ["src/database/seeds/*.seeder.{ts,js}"],
    factories: ["src/database/factories/*.factory.{ts,js}"],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  await runSeeders(dataSource);
};

export const handleMain = (
  moduleRef: NodeJS.Module,
  mainModule: NodeJS.Module | undefined = require.main,
) => {
  if (mainModule === moduleRef) {
    seed().catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
  }
};

handleMain(module);
