import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { EnumDays, Schedule } from "./entity/schedule.entity";
import { Service } from "./entity/service.entity";
import { ServicesService } from "./services.service";
import { BadRequestException } from "@nestjs/common";

describe("ServicesService", () => {
  let service: ServicesService;

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

  const mockSchedule: Schedule[] = [];

  const mockService: Service = {
    id: 1,
    name: "Papelaria D. Beatriz",
    email: "PdB@gmail.com",
    location: "B-142",
    phoneNumber: "+315 999999999",
    schedule: mockSchedule,
    faculty: mockFaculty,
    course: null,
    validateFacultyAndCourses() {},
  };

  const mockTimeInterval: Schedule = {
    id: 1,
    startTime: new Date("1970-01-01T09:00:00Z"),
    endTime: new Date("1970-01-01T17:00:00Z"),
    dayOfWeek: EnumDays.MONDAY,
    service: mockService,
  };

  mockSchedule.push(mockTimeInterval);

  const mockServiceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    merge: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockFacultyRepository = {
    findBy: jest.fn(),
    findOneByOrFail: jest.fn(),
  };

  const mockCourseRepository = {
    findBy: jest.fn(),
    findOneByOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
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

    service = module.get<ServicesService>(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of services", async () => {
      const services = [mockService];
      mockServiceRepository.find.mockResolvedValue(services);

      const result = await service.findAll({});

      expect(result).toEqual(services);
      expect(mockServiceRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ["faculty", "course"],
      });
    });

    it("should filter by facultyId", async () => {
      const services = [mockService];
      mockServiceRepository.find.mockResolvedValue(services);

      const result = await service.findAll({ facultyId: 1 });

      expect(result).toEqual(services);
      expect(mockServiceRepository.find).toHaveBeenCalledWith({
        where: {
          faculty: { id: 1 },
        },
        relations: ["faculty", "course"],
      });
    });

    it("should filter by courseId", async () => {
      const services = [mockService];
      mockServiceRepository.find.mockResolvedValue(services);

      const result = await service.findAll({ courseId: 2 });

      expect(result).toEqual(services);
      expect(mockServiceRepository.find).toHaveBeenCalledWith({
        where: {
          course: { id: 2 },
        },
        relations: ["faculty", "course"],
      });
    });

    it("should filter by both facultyId and courseId", async () => {
      const services = [mockService];
      mockServiceRepository.find.mockResolvedValue(services);

      const result = await service.findAll({ facultyId: 1, courseId: 2 });

      expect(result).toEqual(services);
      expect(mockServiceRepository.find).toHaveBeenCalledWith({
        where: {
          faculty: { id: 1 },
          course: { id: 2 },
        },
        relations: ["faculty", "course"],
      });
    });
  });

  describe("findOne", () => {
    it("should return a service by ID", async () => {
      mockServiceRepository.findOneOrFail.mockResolvedValue(mockService);

      const result = await service.findOne(1);

      expect(result).toEqual(mockService);
      expect(mockServiceRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["faculty", "course"],
      });
    });

    it("should throw if service not found", async () => {
      mockServiceRepository.findOneOrFail.mockRejectedValue(
        new Error("Service with id 1 not found"),
      );

      await expect(service.findOne(1)).rejects.toThrow(
        "Service with id 1 not found",
      );
    });
  });

  describe("create", () => {
    it("should create and return a service", async () => {
      const createServiceDto: CreateServiceDto = {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        email: "PdB@gmail.com",
        phoneNumber: "+315 999999999",
        schedule: mockSchedule,
        courseId: 1,
      };

      const newService = {
        ...createServiceDto,
        faculty: null,
        course: null,
      } as any;
      mockServiceRepository.create.mockReturnValue(newService);
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockServiceRepository.save.mockImplementation(async (s) => {
        if (!s.faculty && !s.course)
          throw new Error(
            "Exactly one of [faculty, course] must be provided, not neither.",
          );
        return { ...s, id: 1 };
      });

      const result = await service.create(createServiceDto);

      expect(result.id).toEqual(1);
      expect(mockServiceRepository.save).toHaveBeenCalled();
    });

    it("should create service with course ID", async () => {
      const createServiceDto: CreateServiceDto = {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        email: "PdB@gmail.com",
        phoneNumber: "+315 999999999",
        schedule: mockSchedule,
        courseId: 1,
      };

      const newService = {
        ...createServiceDto,
        faculty: null,
        course: null,
      } as any;
      mockServiceRepository.create.mockReturnValue(newService);
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockServiceRepository.save.mockImplementation(async (s) => ({
        ...s,
        id: 1,
      }));

      const result = await service.create(createServiceDto);

      expect(mockCourseRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result.course).toEqual(mockCourse);
    });

    it("should create service with faculty ID", async () => {
      const createServiceDto: CreateServiceDto = {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        email: "PdB@gmail.com",
        phoneNumber: "+315 999999999",
        schedule: mockSchedule,
        facultyId: 1,
      };

      const newService = {
        ...createServiceDto,
        faculty: null,
        course: null,
      } as any;
      mockServiceRepository.create.mockReturnValue(newService);
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockServiceRepository.save.mockImplementation(async (s) => ({
        ...s,
        id: 1,
      }));

      const result = await service.create(createServiceDto);

      expect(mockFacultyRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result.faculty).toEqual(mockFaculty);
    });

    it("should throw when both facultyId and courseId are provided", async () => {
      const createServiceDto: CreateServiceDto = {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        email: "PdB@gmail.com",
        phoneNumber: "+315 999999999",
        schedule: mockSchedule,
        facultyId: 1,
        courseId: 1,
      };

      await expect(service.create(createServiceDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw when neither facultyId nor courseId is provided", async () => {
      const createServiceDto: CreateServiceDto = {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        email: "PdB@gmail.com",
        phoneNumber: "+315 999999999",
        schedule: mockSchedule,
      };

      const newService = {
        ...createServiceDto,
        faculty: null,
        course: null,
      } as any;
      mockServiceRepository.create.mockReturnValue(newService);
      mockServiceRepository.save.mockRejectedValue(
        new BadRequestException(
          "Exactly one of [faculty, course] must be provided, not neither.",
        ),
      );

      await expect(service.create(createServiceDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("update", () => {
    it("should update and return the updated service", async () => {
      const updateDto: UpdateServiceDto = {
        name: "New name",
      };

      mockServiceRepository.findOneOrFail.mockResolvedValue(mockService);
      mockServiceRepository.merge.mockImplementation((s, d) =>
        Object.assign(s, d),
      );
      mockServiceRepository.save.mockResolvedValue({
        ...mockService,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(mockServiceRepository.findOneOrFail).toHaveBeenCalled();
      expect(mockServiceRepository.save).toHaveBeenCalled();
      expect(result.name).toEqual("New name");
    });

    it("should throw when both facultyId and courseId are provided", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        facultyId: 1,
        courseId: 1,
      };

      mockServiceRepository.findOneOrFail.mockResolvedValue(mockService);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should update service with facultyId", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        facultyId: 1,
      };

      mockServiceRepository.findOneOrFail.mockResolvedValue({ ...mockService });
      mockServiceRepository.merge.mockImplementation((s, d) =>
        Object.assign(s, d),
      );
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockServiceRepository.save.mockImplementation(async (s) => s);

      const result = await service.update(1, updateDto);

      expect(mockFacultyRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result.faculty).toEqual(mockFaculty);
      expect(result.course).toBeNull();
    });

    it("should update service with courseId", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        courseId: 2,
      };

      mockServiceRepository.findOneOrFail.mockResolvedValue({ ...mockService });
      mockServiceRepository.merge.mockImplementation((s, d) =>
        Object.assign(s, d),
      );
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockServiceRepository.save.mockImplementation(async (s) => s);

      const result = await service.update(1, updateDto);

      expect(mockCourseRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 2,
      });
      expect(result.course).toEqual(mockCourse);
      expect(result.faculty).toBeNull();
    });

    it("should clear course when switching to facultyId", async () => {
      const serviceWithCourse = {
        ...mockService,
        faculty: null,
        course: mockCourse,
      };
      const updateDto: UpdateServiceDto = {
        facultyId: 1,
      };

      mockServiceRepository.findOneOrFail.mockResolvedValue(serviceWithCourse);
      mockServiceRepository.merge.mockImplementation((s, d) =>
        Object.assign(s, d),
      );
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockServiceRepository.save.mockImplementation(async (s) => s);

      const result = await service.update(1, updateDto);

      expect(result.faculty).toEqual(mockFaculty);
      expect(result.course).toBeNull();
    });

    it("should clear faculty when switching to courseId", async () => {
      const serviceWithFaculty = {
        ...mockService,
        faculty: mockFaculty,
        course: null,
      };
      const updateDto: UpdateServiceDto = {
        courseId: 1,
      };

      mockServiceRepository.findOneOrFail.mockResolvedValue(serviceWithFaculty);
      mockServiceRepository.merge.mockImplementation((s, d) =>
        Object.assign(s, d),
      );
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockServiceRepository.save.mockImplementation(async (s) => s);

      const result = await service.update(1, updateDto);

      expect(result.course).toEqual(mockCourse);
      expect(result.faculty).toBeNull();
    });

    it("should throw error if save fails in update", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Error Update",
      };

      mockServiceRepository.findOneOrFail.mockResolvedValue({ ...mockService });
      mockServiceRepository.merge.mockImplementation((s, d) =>
        Object.assign(s, d),
      );
      mockServiceRepository.save.mockRejectedValue(new Error("Save failed"));

      await expect(service.update(1, updateDto)).rejects.toThrow("Save failed");
    });

    it("should allow setting facultyId to null", async () => {
      const updateDto: UpdateServiceDto = {
        facultyId: null as any,
      };

      mockServiceRepository.findOneOrFail.mockResolvedValue({ ...mockService });
      mockServiceRepository.merge.mockImplementation((s, d) =>
        Object.assign(s, d),
      );
      mockServiceRepository.save.mockImplementation(async (s) => s);

      const result = await service.update(1, updateDto);

      expect(result.faculty).toBeNull();
    });

    it("should allow setting courseId to null", async () => {
      const updateDto: UpdateServiceDto = {
        courseId: null as any,
      };

      mockServiceRepository.findOneOrFail.mockResolvedValue({ ...mockService });
      mockServiceRepository.merge.mockImplementation((s, d) =>
        Object.assign(s, d),
      );
      mockServiceRepository.save.mockImplementation(async (s) => s);

      const result = await service.update(1, updateDto);

      expect(result.course).toBeNull();
    });
  });

  describe("remove", () => {
    it("should remove and return the deleted service", async () => {
      mockServiceRepository.findOneByOrFail.mockResolvedValue(mockService);
      mockServiceRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockServiceRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(mockServiceRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockService);
    });
  });
});
