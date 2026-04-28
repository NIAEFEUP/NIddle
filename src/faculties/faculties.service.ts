import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { validateAndGetRelations } from "@/common/utils/entity-relation.utils";
import { Course } from "@/courses/entities/course.entity";
import { FacultyTranslation } from "@/i18n/entities";
import { CreateFacultyDto } from "./dto/create-faculty.dto";
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
    const { courseIds, translations } = createFacultyDto;
    const faculty = new Faculty();
    faculty.defaultLanguage = "en";

    if (translations && translations.length > 0) {
      faculty.translations = translations.map((t) => {
        const translation = new FacultyTranslation();
        translation.languageCode = t.languageCode;
        translation.name = t.name;
        translation.acronym = t.acronym;
        return translation;
      });
    }

    if (courseIds !== undefined) {
      faculty.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        "courses",
      );
    }

    return this.facultyRepository.save(faculty);
  }

  findAll(): Promise<Faculty[]> {
    return this.facultyRepository.find({
      relations: ["translations", "courses"],
    });
  }

  findOne(id: number): Promise<Faculty> {
    return this.facultyRepository.findOneOrFail({
      where: { id },
      relations: ["translations", "courses"],
    });
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    const { courseIds } = updateFacultyDto;

    const faculty = await this.facultyRepository.findOneByOrFail({ id });

    if (courseIds !== undefined) {
      faculty.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        "courses",
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
