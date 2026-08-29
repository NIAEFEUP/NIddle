import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { validateAndGetRelations } from "@/common/utils/entity-relation.utils";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { Course } from "./entities/course.entity";

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

    if (facultyIds !== undefined) {
      course.faculties = await validateAndGetRelations(
        this.facultyRepository,
        facultyIds,
        "faculties",
      );
    }

    return this.courseRepository.save(course);
  }

  async findAll(pagination: PaginationDto): Promise<Course[]> {
    const { page, limit } = pagination;

    const [items] = await this.courseRepository.findAndCount({
      relations: ["faculties"],
      skip: (page - 1) * limit,
      take: limit,
    });

    return items;
  }

  findOne(id: string): Promise<Course> {
    return this.courseRepository.findOneOrFail({
      where: { id },
      relations: ["faculties"],
    });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const { facultyIds, ...courseData } = updateCourseDto;

    const course = await this.courseRepository.findOneByOrFail({ id });

    this.courseRepository.merge(course, courseData);

    if (facultyIds !== undefined) {
      course.faculties = await validateAndGetRelations(
        this.facultyRepository,
        facultyIds,
        "faculties",
      );
    }

    return this.courseRepository.save(course);
  }

  async remove(id: string): Promise<Course> {
    const course = await this.courseRepository.findOneByOrFail({ id });
    await this.courseRepository.delete(id);
    return course;
  }
}
