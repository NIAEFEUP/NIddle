import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Association } from "@/associations/entities/association.entity";
import { PaginatedResponseDto, paginate } from "@/common/pagination";
import { validateAndGetRelations } from "@/common/utils/entity-relation.utils";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Requestable } from "@/requests/interfaces/requestable.interface";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilterDto } from "./dto/event-filter.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { Event } from "./entities/event.entity";

@Injectable()
export class EventsService
  implements Requestable<CreateEventDto, Event, UpdateEventDto>
{
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

  async create(
    createEventDto: CreateEventDto,
    activeAssociationId: string,
  ): Promise<Event> {
    const { facultyId, courseIds, ...eventData } = createEventDto;
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
      id: activeAssociationId,
    });

    return this.eventRepository.save(event);
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const { facultyId, courseIds, ...eventData } = updateEventDto;

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

    return this.eventRepository.save(event);
  }

  createFromRequest(
    payload: CreateEventDto,
    associationId: string,
  ): Promise<Event> {
    return this.create(payload, associationId);
  }

  updateFromRequest(id: string, payload: UpdateEventDto): Promise<Event> {
    return this.update(id, payload);
  }

  async findAll(filters: EventFilterDto): Promise<PaginatedResponseDto<Event>> {
    const { year, facultyId, courseId, sortBy, sortOrder } = filters;

    return paginate(this.eventRepository, filters, {
      where: {
        ...(year !== undefined && { year }),
        ...(facultyId && { faculty: { id: facultyId } }),
        ...(courseId && { courses: { id: courseId } }),
      },
      relations: ["faculty", "courses", "createdBy"],
      order: {
        ...(sortBy && { [sortBy]: sortOrder ?? "ASC" }),
        id: "ASC",
      },
    });
  }

  findOne(id: string): Promise<Event> {
    return this.eventRepository.findOneOrFail({
      where: { id },
      relations: ["faculty", "courses", "createdBy"],
    });
  }

  async remove(id: string): Promise<Event> {
    const event = await this.eventRepository.findOneOrFail({
      where: { id },
      relations: ["createdBy"],
    });

    await this.eventRepository.delete(id);
    return event;
  }

  removeFromRequest(id: string): Promise<Event> {
    return this.remove(id);
  }
}
