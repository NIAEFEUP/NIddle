import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './event.entity';
import { EventFilterDto } from './dto/event-filter.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    return this.eventRepository.save(event);
  }

  findAll(filters: EventFilterDto): Promise<Event[]> {
    const { year, facultyId } = filters;
    return this.eventRepository.find({
      where: {
        ...(year && { year }),
        ...(facultyId && { faculty: { id: facultyId } }),
      },
      relations: ['faculty'],
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['faculty'],
    });
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    await this.eventRepository.update(id, updateEventDto);
    const updatedEvent = await this.eventRepository.findOne({
      where: { id },
      relations: ['faculty'],
    });
    if (!updatedEvent) {
      throw new NotFoundException(`Event with id ${id} not found after update`);
    }
    return updatedEvent;
  }

  async remove(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['faculty'],
    });
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    await this.eventRepository.delete(id);
    return event;
  }
}
