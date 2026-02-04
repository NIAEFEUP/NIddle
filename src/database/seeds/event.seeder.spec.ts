import { DataSource, EntityTarget, Repository } from 'typeorm';
import { SeederFactoryManager } from 'typeorm-extension';
import EventSeeder from './4-event.seeder';
import { Event } from '../../events/entities/event.entity';
import { Faculty } from '../../faculties/entities/faculty.entity';
import { Course } from '../../courses/entities/course.entity';

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

  const mockCourses: Course[] = [
    {
      id: 1,
      name: 'Computer Science',
      acronym: 'CS',
      faculties: [],
      events: [],
    },
    {
      id: 2,
      name: 'Engineering',
      acronym: 'ENG',
      faculties: [],
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

  const mockCourseRepository = {
    find: jest.fn().mockResolvedValue(mockCourses),
  };

  const mockGet = jest.fn().mockReturnValue(mockFactory);
  const mockGetRepository = jest.fn((entity: any) => {
    if (entity === Event) return mockEventRepository;
    if (entity === Faculty) return mockFacultyRepository;
    if (entity === Course) return mockCourseRepository;
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
    mockCourseRepository.find.mockClear();
    mockGetRepository.mockClear();

    mockFactory.make.mockResolvedValue({ ...mockEvent });
    mockFacultyRepository.find.mockResolvedValue(mockFaculties);
    mockCourseRepository.find.mockResolvedValue(mockCourses);
  });

  it('should be defined', () => {
    expect(seeder).toBeDefined();
  });

  it('should seed events', async () => {
    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(Event);
    expect(mockFacultyRepository.find).toHaveBeenCalled();
    expect(mockCourseRepository.find).toHaveBeenCalled();
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

  it('should assign courses to some events', async () => {
    const savedEvents: Event[] = [];
    mockEventRepository.save.mockImplementation((events: Event[]) => {
      savedEvents.push(...events);
      return Promise.resolve(events);
    });

    await seeder.run(dataSource, factoryManager);

    expect(savedEvents.length).toBe(50);
    const eventsWithCourses = savedEvents.filter(
      (event) => event.courses && event.courses.length > 0,
    );
    expect(eventsWithCourses.length).toBeGreaterThan(0);
  });

  it('should use current year if startDate is not a Date instance', async () => {
    const currentYear = new Date().getFullYear();
    mockFactory.make.mockResolvedValue({ ...mockEvent, startDate: undefined });

    const savedEvents: Event[] = [];
    mockEventRepository.save.mockImplementation((events: Event[]) => {
      savedEvents.push(...events);
      return Promise.resolve(events);
    });

    await seeder.run(dataSource, factoryManager);

    savedEvents.forEach((event) => {
      expect(event.year).toBe(currentYear);
    });
  });
});
