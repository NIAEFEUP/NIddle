import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty } from './faculty.entity';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    const { courseIds, ...facultyData } = createFacultyDto;
    const faculty = this.facultyRepository.create(facultyData);

    if (courseIds && courseIds.length > 0) {
      const courses = await this.courseRepository.findBy({
        id: In(courseIds),
      });
      if (courses.length !== courseIds.length) {
        throw new NotFoundException(`One or more courses not found`);
      }
      faculty.courses = courses;
    } else {
      faculty.courses = [];
    }

    return this.facultyRepository.save(faculty);
  }

  findAll(): Promise<Faculty[]> {
    return this.facultyRepository.find({ relations: ['courses'] });
  }

  findOne(id: number): Promise<Faculty> {
    return this.facultyRepository.findOneOrFail({
      where: { id },
      relations: ['courses'],
    });
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    const { courseIds, ...facultyData } = updateFacultyDto;

    const faculty = await this.facultyRepository.findOneBy({ id });

    if (!faculty) {
      throw new NotFoundException(`Faculty with id ${id} not found`);
    }

    this.facultyRepository.merge(faculty, facultyData);

    if (courseIds && courseIds.length > 0) {
      const courses = await this.courseRepository.findBy({
        id: In(courseIds),
      });
      if (courses.length !== courseIds.length) {
        throw new NotFoundException(`One or more courses not found`);
      }
      faculty.courses = courses;
    } else {
      faculty.courses = [];
    }

    return this.facultyRepository.save(faculty);
  }

  async remove(id: number): Promise<Faculty> {
    const faculty = this.facultyRepository.findOneByOrFail({ id });
    await this.facultyRepository.delete(id);
    return faculty;
  }
}
