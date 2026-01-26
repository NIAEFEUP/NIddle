import { DataSource, EntityTarget, Repository } from 'typeorm';
import { SeederFactoryManager } from 'typeorm-extension';
import EventSeeder from './3-event.seeder';
import { Event } from '../../events/entities/event.entity';
import { Faculty } from '../../faculties/entities/faculty.entity';

describe('EventSeeder', () => {
  let seeder: EventSeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockFaculties: Faculty[] = [
    {
      id: 1,
      name: 'Engineering Faculty',
      acronym: 'FEUP',
      courses: [],
      events: [],
    },
    {
      id: 2,
      name: 'Science Faculty',
      acronym: 'FCUP',
      courses: [],
      events: [],
    },
  ];

  const mockEvent: Event = {
    id: 1,
    name: 'FEUP Week',
    description: 'Annual FEUP event',
    year: 2025,
    startDate: new Date('2025-12-26T09:00:00Z'),
    endDate: new Date('2025-12-27T18:00:00Z'),
    faculty: undefined,
    courses: [],
  };

  const mockFactory = {
    make: jest.fn().mockResolvedValue({ ...mockEvent }),
  };

  const mockEventRepository = {
    save: jest.fn().mockResolvedValue([]),
  };

  const mockFacultyRepository = {
    find: jest.fn().mockResolvedValue(mockFaculties),
  };

  const mockGet = jest.fn().mockReturnValue(mockFactory);
  const mockGetRepository = jest.fn((entity: any) => {
    if (entity === Event) return mockEventRepository;
    if (entity === Faculty) return mockFacultyRepository;
    return {} as Repository<any>;
  });

  beforeEach(() => {
    seeder = new EventSeeder();
    dataSource = {
      getRepository: mockGetRepository,
    } as unknown as DataSource;
    factoryManager = {
      get: (entity: EntityTarget<any>) => mockGet(entity) as object,
    } as unknown as SeederFactoryManager;

    mockGet.mockClear();
    mockFactory.make.mockClear();
    mockEventRepository.save.mockClear();
    mockFacultyRepository.find.mockClear();
    mockGetRepository.mockClear();

    mockFactory.make.mockResolvedValue({ ...mockEvent });
    mockFacultyRepository.find.mockResolvedValue(mockFaculties);
  });

  it('should be defined', () => {
    expect(seeder).toBeDefined();
  });

  it('should seed events', async () => {
    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(Event);
    expect(mockFacultyRepository.find).toHaveBeenCalled();
    expect(mockFactory.make).toHaveBeenCalledTimes(50);
    expect(mockEventRepository.save).toHaveBeenCalled();
  });

  it('should assign years to events', async () => {
    const savedEvents: Event[] = [];
    mockEventRepository.save.mockImplementation((events: Event[]) => {
      savedEvents.push(...events);
      return Promise.resolve(events);
    });

    await seeder.run(dataSource, factoryManager);

    expect(savedEvents.length).toBe(50);
    savedEvents.forEach((event) => {
      expect(event.year).toBeDefined();
      expect(typeof event.year).toBe('number');
    });
  });

  it('should assign faculties to some events', async () => {
    const savedEvents: Event[] = [];
    mockEventRepository.save.mockImplementation((events: Event[]) => {
      savedEvents.push(...events);
      return Promise.resolve(events);
    });

    await seeder.run(dataSource, factoryManager);

    expect(savedEvents.length).toBe(50);
    const eventsWithFaculty = savedEvents.filter((event) => event.faculty);
    expect(eventsWithFaculty.length).toBeGreaterThan(0);
  });
});
