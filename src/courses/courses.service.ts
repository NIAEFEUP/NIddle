import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { validateAndGetRelations } from "@/common/utils/entity-relation.utils";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { CourseTranslation } from "@/i18n/entities";
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
    const { facultyIds, translations } = createCourseDto;
    const course = new Course();
    course.defaultLanguage = "en";

    if (translations && translations.length > 0) {
      course.translations = translations.map((t) => {
        const translation = new CourseTranslation();
        translation.languageCode = t.languageCode;
        translation.name = t.name;
        translation.acronym = t.acronym;
        return translation;
      });
    }

    if (facultyIds !== undefined) {
      course.faculties = await validateAndGetRelations(
        this.facultyRepository,
        facultyIds,
        "faculties",
      );
    }

    return this.courseRepository.save(course);
  }

  findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      relations: ["translations", "faculties"],
    });
  }

  findOne(id: number): Promise<Course> {
    return this.courseRepository.findOneOrFail({
      where: { id },
      relations: ["translations", "faculties"],
    });
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const { facultyIds } = updateCourseDto;

    const course = await this.courseRepository.findOneByOrFail({ id });

    if (facultyIds !== undefined) {
      course.faculties = await validateAndGetRelations(
        this.facultyRepository,
        facultyIds,
        "faculties",
      );
    }

    return this.courseRepository.save(course);
  }

  async remove(id: number): Promise<Course> {
    const course = await this.courseRepository.findOneByOrFail({ id });
    await this.courseRepository.delete(id);
    return course;
  }
}
