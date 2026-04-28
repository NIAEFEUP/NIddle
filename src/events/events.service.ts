import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { validateAndGetRelations } from "@/common/utils/entity-relation.utils";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { EventTranslation } from "@/i18n/entities";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilterDto } from "./dto/event-filter.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { Event } from "./entities/event.entity";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { facultyId, courseIds, translations } = createEventDto;
    const event = new Event();
    event.defaultLanguage = "en";

    if (translations && translations.length > 0) {
      event.translations = translations.map((t) => {
        const translation = new EventTranslation();
        translation.languageCode = t.languageCode;
        translation.name = t.name;
        translation.description = t.description ?? null;
        return translation;
      });
    }

    if (facultyId !== undefined) {
      event.faculty = await this.facultyRepository.findOneByOrFail({
        id: facultyId,
      });
    }

    if (courseIds !== undefined) {
      event.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        "courses",
      );
    }

    return this.eventRepository.save(event);
  }

  findAll(filters: EventFilterDto): Promise<Event[]> {
    const { year, facultyId, courseId } = filters;

    return this.eventRepository.find({
      where: {
        ...(year !== undefined && { year }),
        ...(facultyId && { faculty: { id: facultyId } }),
        ...(courseId && { courses: { id: courseId } }),
      },
      relations: ["translations", "faculty", "courses"],
    });
  }

  findOne(id: number): Promise<Event> {
    return this.eventRepository.findOneOrFail({
      where: { id },
      relations: ["translations", "faculty", "courses"],
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const { facultyId, courseIds } = updateEventDto;

    const event = await this.eventRepository.findOneByOrFail({ id });

    if (facultyId !== undefined) {
      event.faculty = await this.facultyRepository.findOneByOrFail({
        id: facultyId,
      });
    }

    if (courseIds !== undefined) {
      event.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        "courses",
      );
    }

    return this.eventRepository.save(event);
  }

  async remove(id: number): Promise<Event> {
    const event = await this.eventRepository.findOneByOrFail({ id });
    await this.eventRepository.delete(id);
    return event;
  }
}
