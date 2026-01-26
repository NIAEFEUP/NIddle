import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';

describe('EventsController', () => {
  let controller: EventsController;

  const mockEvent: Event = {
    id: 1,
    name: 'FEUP Week',
    description: 'Annual FEUP event',
    year: 2025,
    startDate: new Date('2025-12-26T09:00:00Z'),
    endDate: new Date('2025-12-27T18:00:00Z'),
    faculty: undefined,
  };

  const mockEventsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const events = [mockEvent];
      const filters: EventFilterDto = {};
      mockEventsService.findAll.mockResolvedValue(events);

      const result = await controller.findAll(filters);

      expect(result).toEqual(events);
      expect(mockEventsService.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      mockEventsService.findOne.mockResolvedValue(mockEvent);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockEvent);
      expect(mockEventsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
      expect(mockEventsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const createEventDto: CreateEventDto = {
        name: 'FEUP Week',
        description: 'Annual FEUP event',
        year: 2025,
        startDate: '2025-12-26T09:00:00Z',
        endDate: '2025-12-27T18:00:00Z',
        facultyId: 1,
      };
      mockEventsService.create.mockResolvedValue(mockEvent);

      const result = await controller.create(createEventDto);

      expect(result).toEqual(mockEvent);
      expect(mockEventsService.create).toHaveBeenCalledWith(createEventDto);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateEventDto: UpdateEventDto = {
        name: 'Updated Event Name',
      };
      const updatedEvent = { ...mockEvent, ...updateEventDto };
      mockEventsService.update.mockResolvedValue(updatedEvent);

      const result = await controller.update(1, updateEventDto);

      expect(result).toEqual(updatedEvent);
      expect(mockEventsService.update).toHaveBeenCalledWith(1, updateEventDto);
    });

    it('should throw NotFoundException if event not found', async () => {
      const updateEventDto: UpdateEventDto = {
        name: 'Updated Event Name',
      };
      mockEventsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(1, updateEventDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEventsService.update).toHaveBeenCalledWith(1, updateEventDto);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      mockEventsService.remove.mockResolvedValue(mockEvent);

      const result = await controller.remove(1);

      expect(result).toEqual(mockEvent);
      expect(mockEventsService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockEventsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
