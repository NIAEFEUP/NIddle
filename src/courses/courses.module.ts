import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Faculty } from "../faculties/entities/faculty.entity";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { Course } from "./entities/course.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Course, Faculty])],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
