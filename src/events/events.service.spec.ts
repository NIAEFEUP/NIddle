import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Course } from "../courses/entities/course.entity";
import { Faculty } from "../faculties/entities/faculty.entity";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilterDto } from "./dto/event-filter.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { Event } from "./entities/event.entity";
import { EventsService } from "./events.service";

describe("EventsService", () => {
  let service: EventsService;

  const mockEvent: Event = {
    id: 1,
    name: "FEUP Week",
    description: "Annual FEUP event",
    year: 2025,
    startDate: new Date("2025-12-26T09:00:00Z"),
    endDate: new Date("2025-12-27T18:00:00Z"),
    faculty: undefined,
    courses: [],
  };

  const mockFaculty: Faculty = {
    id: 1,
    name: "Engineering Faculty",
    acronym: "FEUP",
    courses: [],
    events: [],
  };

  const mockCourse: Course = {
    id: 1,
    name: "Computer Science",
    acronym: "CS",
    faculties: [],
    events: [],
  };

  const mockEventRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneBy: jest.fn(),
    findOneByOrFail: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockFacultyRepository = {
    findOneByOrFail: jest.fn(),
  };

  const mockCourseRepository = {
    findBy: jest.fn(),
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
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
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
        relations: ["faculty", "courses"],
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
        relations: ["faculty", "courses"],
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
        relations: ["faculty", "courses"],
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
        relations: ["faculty", "courses"],
      });
    });

    it("should return events filtered by year and facultyId", async () => {
      const events = [mockEvent];
      const filters: EventFilterDto = { year: 2025, facultyId: 1 };
      mockEventRepository.find.mockResolvedValue(events);

      const result = await service.findAll(filters);

      expect(result).toEqual(events);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { year: 2025, faculty: { id: 1 } },
        relations: ["faculty", "courses"],
      });
    });

    it("should return events filtered by year and courseId", async () => {
      const events = [mockEvent];
      const filters: EventFilterDto = { year: 2025, courseId: 1 };
      mockEventRepository.find.mockResolvedValue(events);

      const result = await service.findAll(filters);

      expect(result).toEqual(events);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { year: 2025, courses: { id: 1 } },
        relations: ["faculty", "courses"],
      });
    });

    it("should return events filtered by facultyId and courseId", async () => {
      const events = [mockEvent];
      const filters: EventFilterDto = { facultyId: 1, courseId: 1 };
      mockEventRepository.find.mockResolvedValue(events);

      const result = await service.findAll(filters);

      expect(result).toEqual(events);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { faculty: { id: 1 }, courses: { id: 1 } },
        relations: ["faculty", "courses"],
      });
    });

    it("should return events filtered by year, facultyId and courseId", async () => {
      const events = [mockEvent];
      const filters: EventFilterDto = { year: 2025, facultyId: 1, courseId: 1 };
      mockEventRepository.find.mockResolvedValue(events);

      const result = await service.findAll(filters);

      expect(result).toEqual(events);
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { year: 2025, faculty: { id: 1 }, courses: { id: 1 } },
        relations: ["faculty", "courses"],
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
        relations: ["faculty", "courses"],
      });
    });

    it("should throw if event not found", async () => {
      mockEventRepository.findOneOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.findOne(1)).rejects.toThrow("Not found");
    });
  });

  describe("create", () => {
    it("should create an event without faculty", async () => {
      const createEventDto: CreateEventDto = {
        name: "FEUP Week",
        description: "Annual FEUP event",
        year: 2025,
        startDate: "2025-12-26T09:00:00Z",
        endDate: "2025-12-27T18:00:00Z",
      };
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(result).toEqual(mockEvent);
      expect(mockEventRepository.create).toHaveBeenCalledWith({
        name: "FEUP Week",
        description: "Annual FEUP event",
        year: 2025,
        startDate: "2025-12-26T09:00:00Z",
        endDate: "2025-12-27T18:00:00Z",
      });
      expect(mockEventRepository.save).toHaveBeenCalledWith(mockEvent);
    });

    it("should create an event with valid faculty", async () => {
      const createEventDto: CreateEventDto = {
        name: "FEUP Week",
        description: "Annual FEUP event",
        year: 2025,
        startDate: "2025-12-26T09:00:00Z",
        endDate: "2025-12-27T18:00:00Z",
        facultyId: 1,
      };
      mockEventRepository.create.mockReturnValue({ ...mockEvent });
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        faculty: mockFaculty,
      });

      const result = await service.create(createEventDto);

      expect(result.faculty).toEqual(mockFaculty);
      expect(mockFacultyRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
    });

    it("should throw NotFoundException if faculty is not found", async () => {
      const createEventDto: CreateEventDto = {
        name: "FEUP Week",
        description: "Annual FEUP event",
        year: 2025,
        facultyId: 999,
      };
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockFacultyRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.create(createEventDto)).rejects.toThrow("Not found");
    });

    it("should create an event with valid courses", async () => {
      const createEventDto: CreateEventDto = {
        name: "FEUP Week",
        description: "Annual FEUP event",
        year: 2025,
        courseIds: [1],
      };
      mockEventRepository.create.mockReturnValue({ ...mockEvent });
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        courses: [mockCourse],
      });

      const result = await service.create(createEventDto);

      expect(result.courses).toEqual([mockCourse]);
      expect(mockCourseRepository.findBy).toHaveBeenCalled();
    });

    it("should throw NotFoundException if any course is not found", async () => {
      const createEventDto: CreateEventDto = {
        name: "FEUP Week",
        description: "Annual FEUP event",
        year: 2025,
        courseIds: [1, 2],
      };
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);

      await expect(service.create(createEventDto)).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update an event successfully", async () => {
      const updateEventDto: UpdateEventDto = { name: "New Event Name" };
      mockEventRepository.findOneByOrFail.mockResolvedValue({ ...mockEvent });
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        name: "New Event Name",
      });

      const result = await service.update(1, updateEventDto);

      expect(result.name).toEqual("New Event Name");
      expect(mockEventRepository.merge).toHaveBeenCalled();
      expect(mockEventRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if event not found", async () => {
      mockEventRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.update(1, {})).rejects.toThrow("Not found");
    });

    it("should update faculty if provided", async () => {
      const updateEventDto: UpdateEventDto = { facultyId: 1 };
      mockEventRepository.findOneByOrFail.mockResolvedValue({ ...mockEvent });
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        faculty: mockFaculty,
      });

      const result = await service.update(1, updateEventDto);

      expect(result.faculty).toEqual(mockFaculty);
      expect(mockFacultyRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
    });

    it("should throw NotFoundException if updating with invalid faculty ID", async () => {
      const updateEventDto: UpdateEventDto = { facultyId: 999 };
      mockEventRepository.findOneByOrFail.mockResolvedValue({ ...mockEvent });
      mockFacultyRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.update(1, updateEventDto)).rejects.toThrow(
        "Not found",
      );
    });

    it("should update courses if provided", async () => {
      const updateEventDto: UpdateEventDto = { courseIds: [1] };
      mockEventRepository.findOneByOrFail.mockResolvedValue({ ...mockEvent });
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        courses: [mockCourse],
      });

      const result = await service.update(1, updateEventDto);

      expect(result.courses).toEqual([mockCourse]);
    });

    it("should throw NotFoundException if updating with invalid course IDs", async () => {
      const updateEventDto: UpdateEventDto = { courseIds: [1, 2] };
      mockEventRepository.findOneByOrFail.mockResolvedValue({ ...mockEvent });
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);

      await expect(service.update(1, updateEventDto)).rejects.toThrow();
    });

    it("should clear courses if empty array provided", async () => {
      const updateEventDto: UpdateEventDto = { courseIds: [] };
      mockEventRepository.findOneByOrFail.mockResolvedValue({
        ...mockEvent,
        courses: [mockCourse],
      });
      mockEventRepository.save.mockResolvedValue({
        ...mockEvent,
        courses: [],
      });

      const result = await service.update(1, updateEventDto);

      expect(result.courses).toEqual([]);
    });
  });

  describe("remove", () => {
    it("should remove an event", async () => {
      mockEventRepository.findOneByOrFail.mockResolvedValue(mockEvent);
      mockEventRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual(mockEvent);
      expect(mockEventRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw if event not found", async () => {
      mockEventRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.remove(1)).rejects.toThrow("Not found");
    });
  });
});
