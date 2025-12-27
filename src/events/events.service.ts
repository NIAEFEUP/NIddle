import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  create(createEventDto: CreateEventDto): Promise<Event> {
    return this.eventRepository.manager.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const event = eventRepo.create(createEventDto);
      return eventRepo.save(event);
    });
  }

  findAll(): Promise<Event[]> {
    return this.eventRepository.find({ relations: ['faculty'] });
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

  update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    return this.eventRepository.manager.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const event = await eventRepo.findOneBy({ id });
      if (!event) {
        throw new NotFoundException(`Event with id ${id} not found`);
      }
      await eventRepo.update(id, updateEventDto);
      const updatedEvent = await eventRepo.findOneBy({ id });
      if (!updatedEvent) {
        throw new NotFoundException(
          `Event with id ${id} not found after update`,
        );
      }
      return updatedEvent;
    });
  }

  remove(id: number): Promise<Event> {
    return this.eventRepository.manager.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);
      const event = await eventRepo.findOneBy({ id });
      if (!event) {
        throw new NotFoundException(`Event with id ${id} not found`);
      }
      await eventRepo.delete(id);
      return event;
    });
  }
}
