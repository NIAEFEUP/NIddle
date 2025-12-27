import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { In, Repository } from 'typeorm';
import { Faculty } from '../faculties/entities/faculty.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { facultyIds, ...courseData } = createCourseDto;
    const course = this.courseRepository.create(courseData);

    if (facultyIds && facultyIds.length > 0) {
      const faculties = await this.facultyRepository.findBy({
        id: In(facultyIds),
      });
      if (faculties.length !== facultyIds.length) {
        throw new NotFoundException(`One or more faculties not found`);
      }
      course.faculties = faculties;
    }

    return this.courseRepository.save(course);
  }

  findAll(): Promise<Course[]> {
    return this.courseRepository.find({ relations: ['faculties'] });
  }

  findOne(id: number): Promise<Course> {
    return this.courseRepository.findOneOrFail({
      where: { id },
      relations: ['faculties'],
    });
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const { facultyIds, ...courseData } = updateCourseDto;

    const course = await this.courseRepository.findOneBy({ id });

    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    this.courseRepository.merge(course, courseData);

    if (facultyIds) {
      if (facultyIds.length > 0) {
        const faculties = await this.facultyRepository.findBy({
          id: In(facultyIds),
        });
        if (faculties.length !== facultyIds.length) {
          throw new NotFoundException(`One or more faculties not found`);
        }
        course.faculties = faculties;
      } else {
        course.faculties = [];
      }
    }

    return this.courseRepository.save(course);
  }

  async remove(id: number): Promise<Course> {
    const course = await this.courseRepository.findOneByOrFail({ id });
    await this.courseRepository.delete(id);
    return course;
  }
}
