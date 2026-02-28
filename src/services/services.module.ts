import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Schedule } from "./entity/schedule.entity";
import { Service } from "./entity/service.entity";
import { ServicesController } from "./services.controller";
import { ServicesService } from "./services.service";

@Module({
  imports: [TypeOrmModule.forFeature([Service, Schedule, Faculty, Course])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
