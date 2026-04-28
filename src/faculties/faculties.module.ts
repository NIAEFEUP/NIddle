import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "@/courses/entities/course.entity";
import { FacultyTranslation } from "@/i18n/entities";
import { Faculty } from "./entities/faculty.entity";
import { FacultiesController } from "./faculties.controller";
import { FacultiesService } from "./faculties.service";

@Module({
  imports: [TypeOrmModule.forFeature([Faculty, Course, FacultyTranslation])],
  controllers: [FacultiesController],
  providers: [FacultiesService],
})
export class FacultiesModule {}
