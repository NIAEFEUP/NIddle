import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultiesService } from './faculties.service';
import { FacultiesController } from './faculties.controller';
import { Faculty } from './faculty.entity';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Faculty, Course])],
  controllers: [FacultiesController],
  providers: [FacultiesService],
})
export class FacultiesModule {}
