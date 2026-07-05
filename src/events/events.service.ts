import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Association } from "@/associations/entities/association.entity";
import { validateAndGetRelations } from "@/common/utils/entity-relation.utils";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
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
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { facultyId, courseIds, createdById, ...eventData } = createEventDto;
    const event = this.eventRepository.create(eventData);

    if (facultyId) {
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

    event.createdBy = await this.associationRepository.findOneByOrFail({
      id: createdById,
    });

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
      relations: ["faculty", "courses", "createdBy"],
    });
  }

  findOne(id: number): Promise<Event> {
    return this.eventRepository.findOneOrFail({
      where: { id },
      relations: ["faculty", "courses", "createdBy"],
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const { facultyId, courseIds, createdById, ...eventData } = updateEventDto;

    const event = await this.eventRepository.findOneOrFail({
      where: { id },
      relations: ["faculty", "courses", "createdBy"],
    });
    this.eventRepository.merge(event, eventData);

    if (facultyId !== undefined) {
      if (facultyId === null) {
        event.faculty = undefined;
      } else {
        event.faculty = await this.facultyRepository.findOneByOrFail({
          id: facultyId,
        });
      }
    }

    if (courseIds !== undefined) {
      event.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        "courses",
      );
    }

    if (createdById !== undefined) {
      event.createdBy = await this.associationRepository.findOneByOrFail({
        id: createdById,
      });
    }

    return this.eventRepository.save(event);
  }

  async remove(id: number): Promise<Event> {
    const event = await this.eventRepository.findOneByOrFail({ id });
    await this.eventRepository.delete(id);
    return event;
  }
}
