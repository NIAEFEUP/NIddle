import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginatedResponseDto, paginate } from "@/common/pagination";
import { buildOrderClause } from "@/common/sorting";
import { validateAndGetRelations } from "@/common/utils/entity-relation.utils";
import { Course } from "@/courses/entities/course.entity";
import { CreateFacultyDto } from "./dto/create-faculty.dto";
import { FacultyFilterDto } from "./dto/faculty-filter.dto";
import { UpdateFacultyDto } from "./dto/update-faculty.dto";
import { Faculty } from "./entities/faculty.entity";

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
        "courses",
      );
    }

    return this.facultyRepository.save(faculty);
  }

  async findAll(
    filters: FacultyFilterDto,
  ): Promise<PaginatedResponseDto<Faculty>> {
    const { courseId } = filters;

    return paginate(this.facultyRepository, filters, {
      where: {
        ...(courseId && { courses: { id: courseId } }),
      },
      relations: ["courses"],
      order: buildOrderClause(filters),
    });
  }

  findOne(id: string): Promise<Faculty> {
    return this.facultyRepository.findOneOrFail({
      where: { id },
      relations: ["courses"],
    });
  }

  async update(
    id: string,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    const { courseIds, ...facultyData } = updateFacultyDto;

    const faculty = await this.facultyRepository.findOneByOrFail({ id });

    this.facultyRepository.merge(faculty, facultyData);

    if (courseIds !== undefined) {
      faculty.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        "courses",
      );
    }

    return this.facultyRepository.save(faculty);
  }

  async remove(id: string): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOneByOrFail({ id });
    await this.facultyRepository.delete(id);
    return faculty;
  }
}
