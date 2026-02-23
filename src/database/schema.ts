import { DataSource, DataSourceOptions } from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { User } from "@/users/entities/user.entity";

export const createSchema = async () => {
  const options: DataSourceOptions = {
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    username: process.env.DATABASE_USER || "niddle",
    password: process.env.DATABASE_PASSWORD || "niddle",
    database: process.env.DATABASE_NAME || "niddle_db",
    synchronize: true,
    dropSchema: false,
    entities: [Course, Faculty, User, Event],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();
  console.log("Database schema created successfully.");
  await dataSource.destroy();
};

createSchema().catch((err) => {
  console.error("Schema creation failed:", err);
  process.exit(1);
});
