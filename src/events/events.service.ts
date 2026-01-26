import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EventFilterDto } from './dto/event-filter.dto';
import { Faculty } from '../faculties/entities/faculty.entity';
import { Course } from '../courses/entities/course.entity';
import { validateAndGetRelations } from '../common/utils/entity-relation.utils';

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
    const { facultyId, courseIds, ...eventData } = createEventDto;
    const event = this.eventRepository.create(eventData);

    if (facultyId !== undefined) {
      event.faculty = await this.facultyRepository.findOneByOrFail({
        id: facultyId,
      });
    }

    if (courseIds !== undefined) {
      event.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        'courses',
      );
    }

    return this.eventRepository.save(event);
  }

  findAll(filters: EventFilterDto): Promise<Event[]> {
    const { year, facultyId } = filters;
    return this.eventRepository.find({
      where: {
        ...(year && { year }),
        ...(facultyId && { faculty: { id: facultyId } }),
      },
      relations: ['faculty', 'courses'],
    });
  }

  findOne(id: number): Promise<Event> {
    return this.eventRepository.findOneOrFail({
      where: { id },
      relations: ['faculty', 'courses'],
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const { facultyId, courseIds, ...eventData } = updateEventDto;

    const event = await this.eventRepository.findOneByOrFail({ id });
    this.eventRepository.merge(event, eventData);

    if (facultyId !== undefined) {
      event.faculty = await this.facultyRepository.findOneByOrFail({
        id: facultyId,
      });
    }

    if (courseIds !== undefined) {
      event.courses = await validateAndGetRelations(
        this.courseRepository,
        courseIds,
        'courses',
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
