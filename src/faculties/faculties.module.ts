import { Course } from "@courses/entities/course.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Faculty } from "./entities/faculty.entity";
import { FacultiesController } from "./faculties.controller";
import { FacultiesService } from "./faculties.service";

@Module({
  imports: [TypeOrmModule.forFeature([Faculty, Course])],
  controllers: [FacultiesController],
  providers: [FacultiesService],
})
export class FacultiesModule {}
