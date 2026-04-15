import { DataSource, DataSourceOptions } from "typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { getDatabaseSynchronize } from "./synchronize";

export const createSchema = async () => {
  const synchronize = getDatabaseSynchronize();

  const options: DataSourceOptions = {
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    username: process.env.DATABASE_USER || "niddle",
    password: process.env.DATABASE_PASSWORD || "niddle",
    database: process.env.DATABASE_NAME || "niddle_db",
    synchronize,
    dropSchema: false,
    schema: "public",
    entities: [Association, Course, Faculty, User, Event, Service, Schedule],
  };

  const dataSource = new DataSource(options);
  try {
    await dataSource.initialize();
    if (options.synchronize) {
      console.log("Database schema created successfully.");
    } else {
      console.log(
        "Database connection initialized; schema synchronization is disabled (set DATABASE_SYNCHRONIZE=true to enable it).",
      );
    }
    await dataSource.destroy();
  } catch (err) {
    console.error("Schema creation failed:", err);
    throw err;
  }
};

export const handleMain = (
  moduleRef: NodeJS.Module,
  mainModule: NodeJS.Module | undefined = require.main,
) => {
  if (mainModule === moduleRef) {
    createSchema().catch(() => {
      process.exit(1);
    });
  }
};

handleMain(module);
