import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty } from './entities/faculty.entity';
import { validateAndGetRelations } from '../common/utils/entity-relation.utils';

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

    if (courseIds !== undefined) {
      faculty.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        'courses',
      );
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

    if (courseIds !== undefined) {
      faculty.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        'courses',
      );
    }

    return this.facultyRepository.save(faculty);
  }

  async remove(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOneByOrFail({ id });
    await this.facultyRepository.delete(id);
    return faculty;
  }
}
