import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { Calendar } from './calendar.entity';
import { Faculty } from '../faculties/faculty.entity';
import { Event } from '../events/event.entity';

@Injectable()
export class CalendarsService {
  constructor(
    @InjectRepository(Calendar)
    private calendarRepository: Repository<Calendar>,
  ) {}

  async create(createCalendarDto: CreateCalendarDto): Promise<Calendar> {
    return this.calendarRepository.manager.transaction(async (manager) => {
      const calendarRepo = manager.getRepository(Calendar);
      const facultyRepo = manager.getRepository(Faculty);
      const eventRepo = manager.getRepository(Event);

      const faculty = await facultyRepo.findOneBy({
        id: createCalendarDto.facultyId,
      });
      if (!faculty) {
        throw new NotFoundException(
          `Faculty with id ${createCalendarDto.facultyId} not found`,
        );
      }

      let events: Event[] = [];
      if (createCalendarDto.eventIds && createCalendarDto.eventIds.length > 0) {
        events = await eventRepo.findBy({ id: In(createCalendarDto.eventIds) });
      }

      const calendar = calendarRepo.create({
        name: createCalendarDto.name,
        description: createCalendarDto.description,
        faculty,
        events,
      });
      return calendarRepo.save(calendar);
    });
  }

  findAll(): Promise<Calendar[]> {
    return this.calendarRepository.find({ relations: ['faculty', 'events'] });
  }

  async findOne(id: number): Promise<Calendar> {
    const calendar = await this.calendarRepository.findOne({
      where: { id },
      relations: ['faculty', 'events'],
    });
    if (!calendar) {
      throw new NotFoundException(`Calendar with id ${id} not found`);
    }
    return calendar;
  }

  async update(
    id: number,
    updateCalendarDto: UpdateCalendarDto,
  ): Promise<Calendar> {
    return this.calendarRepository.manager.transaction(async (manager) => {
      const calendarRepo = manager.getRepository(Calendar);
      const facultyRepo = manager.getRepository(Faculty);
      const eventRepo = manager.getRepository(Event);

      const calendar = await calendarRepo.findOne({
        where: { id },
        relations: ['faculty', 'events'],
      });
      if (!calendar) {
        throw new NotFoundException(`Calendar with id ${id} not found`);
      }

      if (updateCalendarDto.facultyId !== undefined) {
        const faculty = await facultyRepo.findOneBy({
          id: updateCalendarDto.facultyId,
        });
        if (!faculty) {
          throw new NotFoundException(
            `Faculty with id ${updateCalendarDto.facultyId} not found`,
          );
        }
        calendar.faculty = faculty;
      }

      if (updateCalendarDto.eventIds !== undefined) {
        calendar.events = await eventRepo.findBy({
          id: In(updateCalendarDto.eventIds),
        });
      }

      if (updateCalendarDto.name !== undefined) {
        calendar.name = updateCalendarDto.name;
      }
      if (updateCalendarDto.description !== undefined) {
        calendar.description = updateCalendarDto.description;
      }

      await calendarRepo.save(calendar);
      const updated = await calendarRepo.findOne({
        where: { id },
        relations: ['faculty', 'events'],
      });
      if (!updated) {
        throw new NotFoundException(
          `Calendar with id ${id} not found after update`,
        );
      }
      return updated;
    });
  }

  async remove(id: number): Promise<Calendar> {
    return this.calendarRepository.manager.transaction(async (manager) => {
      const calendarRepo = manager.getRepository(Calendar);
      const calendar = await calendarRepo.findOne({
        where: { id },
        relations: ['faculty', 'events'],
      });
      if (!calendar) {
        throw new NotFoundException(`Calendar with id ${id} not found`);
      }
      await calendarRepo.remove(calendar);
      return calendar;
    });
  }
}
