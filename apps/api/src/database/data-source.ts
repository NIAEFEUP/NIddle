import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Request } from "@/requests/entities/request.entity";
import { Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { SentryTypeOrmLogger } from "./sentry-typeorm.logger";

if (process.env.NODE_ENV !== "test") {
  config({ path: ".env.local" });
}

export const ENTITIES = [
  Association,
  Course,
  Faculty,
  User,
  Event,
  Service,
  Schedule,
  Request,
];

export const getDataSourceOptions = (): DataSourceOptions => {
  const connection = {
    host: process.env.DATABASE_MASTER,
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  };

  const slaveHost = process.env.DATABASE_SLAVE;

  return {
    type: "postgres",
    maxQueryExecutionTime: 300,
    logger: new SentryTypeOrmLogger(),
    schema: "public",
    entities: ENTITIES,
    migrations: [
      process.env.NODE_ENV === "production"
        ? "dist/database/migrations/*.js"
        : "src/database/migrations/*.ts",
    ],
    synchronize: process.env.NODE_ENV === "development",
    ...(slaveHost
      ? {
          replication: {
            master: connection,
            slaves: [{ ...connection, host: slaveHost }],
          },
        }
      : connection),
  };
};

export const AppDataSource = new DataSource(getDataSourceOptions());
export default AppDataSource;
