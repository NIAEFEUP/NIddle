import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Faculty } from '../faculties/faculty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Faculty])],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
