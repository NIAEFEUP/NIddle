import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Request } from "@/requests/entities/request.entity";
import { Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";

export function getTestDatabaseOptions(): TypeOrmModuleOptions {
  return {
    type: "postgres",
    host: process.env.TEST_DATABASE_HOST,
    port: Number(process.env.TEST_DATABASE_PORT),
    username: process.env.TEST_DATABASE_USER,
    password: process.env.TEST_DATABASE_PASSWORD,
    database: process.env.TEST_DATABASE_NAME,
    entities: [
      Association,
      Course,
      Event,
      Faculty,
      Request,
      Schedule,
      Service,
      User,
    ],
    synchronize: true,
  };
}
