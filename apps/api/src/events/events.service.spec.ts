import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilterDto } from "./dto/event-filter.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { Event } from "./entities/event.entity";
import { EventsService } from "./events.service";

describe("EventsService", () => {
  let service: EventsService;

  const mockAssociation: Association = {
    id: 1,
    name: "Chess Club",
    users: [],
    events: [],
    services: [],
    requests: [],
  };

  const mockFaculty: Faculty = {
    id: 1,
    name: "Engineering Faculty",
    acronym: "FEUP",
    events: [],
    courses: [],
  };

  const mockCourse: Course = {
    id: 1,
    name: "Computer Science",
    acronym: "CS",
    faculties: [],
    events: [],
  };

  const mockEvent: Event = {
    id: 1,
    name: "FEUP Week",
    description: "Annual FEUP event",
    year: 2025,
    startDate: new Date("2025-12-26T09:00:00Z"),
    endDate: new Date("2025-12-27T18:00:00Z"),
    faculty: mockFaculty,
    courses: [mockCourse],
    createdBy: mockAssociation,
  };

  const mockEventRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockFacultyRepository = {
    findOneByOrFail: jest.fn(),
  };

  const mockCourseRepository = {
    findOneByOrFail: jest.fn(),
    findBy: jest.fn(),
  };

  const mockAssociationRepository = {
    findOneByOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockFacultyRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
        {
          provide: getRepositoryToken(Association),
          useValue: mockAssociationRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    mockAssociationRepository.findOneByOrFail.mockResolvedValue(
      mockAssociation,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of events without filters", async () => {
      const events = [mockEvent];
      const filters: EventFilterDto = {};
      mockEventRepository.find.mockResolvedValue(events);

      const result = await service.findAll(filters);

      expect(result).toEqual(events);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ["faculty", "courses", "createdBy"],
      });
    });

    it("should return events filtered by year", async () => {
      const events = [mockEvent];
      const filters: EventFilterDto = { year: 2025 };
      mockEventRepository.find.mockResolvedValue(events);

      const result = await service.findAll(filters);

      expect(result).toEqual(events);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { year: 2025 },
        relations: ["faculty", "courses", "createdBy"],
      });
    });

    it("should return events filtered by facultyId", async () => {
      const events = [mockEvent];
      const filters: EventFilterDto = { facultyId: 1 };
      mockEventRepository.find.mockResolvedValue(events);

      const result = await service.findAll(filters);

      expect(result).toEqual(events);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { faculty: { id: 1 } },
        relations: ["faculty", "courses", "createdBy"],
      });
    });

    it("should return events filtered by courseId", async () => {
      const events = [mockEvent];
      const filters: EventFilterDto = { courseId: 1 };
      mockEventRepository.find.mockResolvedValue(events);

      const result = await service.findAll(filters);

      expect(result).toEqual(events);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { courses: { id: 1 } },
        relations: ["faculty", "courses", "createdBy"],
      });
    });
  });

  describe("findOne", () => {
    it("should return an event by ID", async () => {
      mockEventRepository.findOneOrFail.mockResolvedValue(mockEvent);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEvent);
      expect(mockEventRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["faculty", "courses", "createdBy"],
      });
    });
  });

  describe("create", () => {
    it("should create an event with faculty", async () => {
      const createEventDto: CreateEventDto = {
        name: "FEUP Week",
        description: "Annual FEUP event",
        year: 2025,
        startDate: "2025-12-26T09:00:00Z",
        endDate: "2025-12-27T18:00:00Z",
        facultyId: 1,
      };
      const createdMock = { ...mockEvent, faculty: mockFaculty, courses: [] };
      mockEventRepository.create.mockReturnValue(createdMock);
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockEventRepository.save.mockResolvedValue(createdMock);

      const result = await service.create(createEventDto, 1);

      expect(result.faculty).toEqual(mockFaculty);
      expect(mockEventRepository.save).toHaveBeenCalled();
    });

    it("should create an event with courses", async () => {
      const createEventDto: CreateEventDto = {
        name: "FEUP Week",
        description: "Annual FEUP event",
        year: 2025,
        startDate: "2025-12-26T09:00:00Z",
        endDate: "2025-12-27T18:00:00Z",
        courseIds: [1],
      };
      const createdMock = {
        ...mockEvent,
        courses: [mockCourse],
        faculty: undefined,
      };
      mockEventRepository.create.mockReturnValue(createdMock);
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);
      mockEventRepository.save.mockResolvedValue(createdMock);

      const result = await service.create(createEventDto, 1);

      expect(result.courses).toEqual([mockCourse]);
      expect(mockEventRepository.save).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update an event successfully", async () => {
      const updateEventDto: UpdateEventDto = { name: "New Event Name" };
      mockEventRepository.findOneOrFail.mockResolvedValue({ ...mockEvent });
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        name: "New Event Name",
      });

      const result = await service.update(1, updateEventDto);

      expect(result.name).toEqual("New Event Name");
      expect(mockEventRepository.save).toHaveBeenCalled();
    });

    it("should update faculty if provided", async () => {
      const updateEventDto: UpdateEventDto = { facultyId: 1 };
      mockEventRepository.findOneOrFail.mockResolvedValue({ ...mockEvent });
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        faculty: mockFaculty,
        courses: [],
      });

      const result = await service.update(1, updateEventDto);

      expect(result.faculty).toEqual(mockFaculty);
    });

    it("should clear faculty when facultyId is null", async () => {
      const updateEventDto: UpdateEventDto = { facultyId: null as any };
      mockEventRepository.findOneOrFail.mockResolvedValue({
        ...mockEvent,
        faculty: mockFaculty,
      });
      mockEventRepository.save.mockImplementation(async (e) => e);

      const result = await service.update(1, updateEventDto);

      expect(result.faculty).toBeUndefined();
    });

    it("should update courses if courseIds is provided", async () => {
      const updateEventDto: UpdateEventDto = { courseIds: [1] };
      mockEventRepository.findOneOrFail.mockResolvedValue({ ...mockEvent });
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);
      mockEventRepository.save.mockImplementation(async (e) => e);

      const result = await service.update(1, updateEventDto);

      expect(mockCourseRepository.findBy).toHaveBeenCalled();
      expect(result.courses).toEqual([mockCourse]);
    });
  });

  describe("remove", () => {
    it("should remove an event", async () => {
      mockEventRepository.findOneOrFail.mockResolvedValue(mockEvent);
      mockEventRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual(mockEvent);
      expect(mockEventRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("createFromRequest", () => {
    it("delegates to create", async () => {
      const createEventDto: CreateEventDto = { name: "FEUP Week", year: 2025 };
      jest.spyOn(service, "create").mockResolvedValue(mockEvent);

      const result = await service.createFromRequest(createEventDto, 1);

      expect(service.create).toHaveBeenCalledWith(createEventDto, 1);
      expect(result).toEqual(mockEvent);
    });
  });

  describe("updateFromRequest", () => {
    it("delegates to update", async () => {
      const updateEventDto: UpdateEventDto = { name: "FEUP Week Updated" };
      jest.spyOn(service, "update").mockResolvedValue(mockEvent);

      const result = await service.updateFromRequest(1, updateEventDto);

      expect(service.update).toHaveBeenCalledWith(1, updateEventDto);
      expect(result).toEqual(mockEvent);
    });
  });

  describe("removeFromRequest", () => {
    it("delegates to remove", async () => {
      jest.spyOn(service, "remove").mockResolvedValue(mockEvent);

      const result = await service.removeFromRequest(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEvent);
    });
  });
});
