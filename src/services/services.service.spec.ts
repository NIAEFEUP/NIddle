import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { EnumDays, Schedule } from "./entity/schedule.entity";
import { Service } from "./entity/service.entity";
import { ServicesService } from "./services.service";

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
    course: mockCourse,
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

  (mockTimeInterval as any).schedule = null;
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

      mockServiceRepository.create.mockReturnValue({
        name: createServiceDto.name,
        location: createServiceDto.location,
        email: createServiceDto.email,
        phoneNumber: createServiceDto.phoneNumber,
        schedule: createServiceDto.schedule,
        validateFacultyAndCourses: jest.fn(),
      } as any);
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockServiceRepository.save.mockResolvedValue(mockService);

      const result = await service.create(createServiceDto);

      expect(result).toEqual(mockService);
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

      const serviceWithCourse = { ...mockService, course: mockCourse };

      mockServiceRepository.create.mockReturnValue({
        name: createServiceDto.name,
        location: createServiceDto.location,
        email: createServiceDto.email,
        phoneNumber: createServiceDto.phoneNumber,
        schedule: createServiceDto.schedule,
        validateFacultyAndCourses: jest.fn(),
      } as any);
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockServiceRepository.save.mockResolvedValue(serviceWithCourse);

      const result = await service.create(createServiceDto);

      expect(mockCourseRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result).toEqual(serviceWithCourse);
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

      mockServiceRepository.create.mockReturnValue({
        name: createServiceDto.name,
        location: createServiceDto.location,
        email: createServiceDto.email,
        phoneNumber: createServiceDto.phoneNumber,
        schedule: createServiceDto.schedule,
      } as any);

      await expect(service.create(createServiceDto)).rejects.toThrow(
        "Exactly one of [facultyId, courseId] must be provided, not both and not neither.",
      );
    });

    it("should create service with facultyId", async () => {
      const createServiceDto: CreateServiceDto = {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        email: "PdB@gmail.com",
        phoneNumber: "+315 999999999",
        schedule: mockSchedule,
        facultyId: 1,
      };

      const serviceWithFaculty = { ...mockService, faculty: mockFaculty };

      mockServiceRepository.create.mockReturnValue({
        name: createServiceDto.name,
        location: createServiceDto.location,
        email: createServiceDto.email,
        phoneNumber: createServiceDto.phoneNumber,
        schedule: createServiceDto.schedule,
        validateFacultyAndCourses: jest.fn(),
      } as any);
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockServiceRepository.save.mockResolvedValue(serviceWithFaculty);

      const result = await service.create(createServiceDto);

      expect(mockFacultyRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result).toEqual(serviceWithFaculty);
    });

    it("should throw when neither facultyId nor courseId is provided", async () => {
      const createServiceDto: CreateServiceDto = {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        email: "PdB@gmail.com",
        phoneNumber: "+315 999999999",
        schedule: mockSchedule,
      };

      mockServiceRepository.create.mockReturnValue({
        name: createServiceDto.name,
        location: createServiceDto.location,
        email: createServiceDto.email,
        phoneNumber: createServiceDto.phoneNumber,
        schedule: createServiceDto.schedule,
      } as any);

      await expect(service.create(createServiceDto)).rejects.toThrow(
        "Exactly one of [facultyId, courseId] must be provided, not both and not neither.",
      );
    });
  });

  describe("update", () => {
    it("should update and return the updated service", async () => {
      const updateDto: UpdateServiceDto = {
        name: "New name",
      } as UpdateServiceDto;

      mockServiceRepository.findOneByOrFail.mockResolvedValue(mockService);
      mockServiceRepository.merge.mockReturnValue({
        ...mockService,
        ...updateDto,
      });
      mockServiceRepository.save.mockResolvedValue({
        ...mockService,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(mockServiceRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(mockServiceRepository.merge).toHaveBeenCalled();
      expect(mockServiceRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ ...mockService, ...updateDto });
    });

    it("should update service with course IDs", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        courseIds: [2, 3],
      } as UpdateServiceDto;

      const updatedService = { ...mockService, ...updateDto };

      mockServiceRepository.findOneByOrFail.mockResolvedValue(mockService);
      mockServiceRepository.merge.mockReturnValue(updatedService);
      mockCourseRepository.findOneByOrFail = jest
        .fn()
        .mockResolvedValue(mockCourse);
      mockServiceRepository.save.mockResolvedValue(updatedService);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedService);
    });

    it("should update service with empty course IDs", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        courseIds: [],
      } as UpdateServiceDto;

      const updatedService = { ...mockService, ...updateDto, courses: [] };

      mockServiceRepository.findOneByOrFail.mockResolvedValue(mockService);
      mockServiceRepository.merge.mockReturnValue(updatedService);
      mockServiceRepository.save.mockResolvedValue(updatedService);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedService);
    });

    it("should throw if service to update not found", async () => {
      mockServiceRepository.findOneByOrFail.mockRejectedValue(
        new Error("Service with id 1 not found"),
      );

      await expect(
        service.update(1, { name: "x" } as UpdateServiceDto),
      ).rejects.toThrow("Service with id 1 not found");
    });

    it("should throw if service not found after update", async () => {
      const updateDto: UpdateServiceDto = { name: "x" } as UpdateServiceDto;

      mockServiceRepository.findOneByOrFail.mockResolvedValue(mockService);
      mockServiceRepository.merge.mockReturnValue({
        ...mockService,
        ...updateDto,
      });
      mockServiceRepository.save.mockRejectedValue(
        new Error("Service with id 1 not found after update"),
      );

      await expect(service.update(1, updateDto)).rejects.toThrow(
        "Service with id 1 not found after update",
      );
    });

    it("should throw when both facultyId and courseId are provided", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        facultyId: 1,
        courseId: 1,
      } as UpdateServiceDto;

      mockServiceRepository.findOneByOrFail.mockResolvedValue(mockService);
      mockServiceRepository.merge.mockReturnValue({
        ...mockService,
        ...updateDto,
      });

      try {
        await service.update(1, updateDto);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it("should update service with facultyId", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        facultyId: 1,
      } as UpdateServiceDto;

      const updatedService = {
        ...mockService,
        faculty: mockFaculty,
        ...updateDto,
      };

      mockServiceRepository.findOneByOrFail.mockResolvedValue(mockService);
      mockServiceRepository.merge.mockReturnValue(updatedService);
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockServiceRepository.save.mockResolvedValue(updatedService);

      const result = await service.update(1, updateDto);

      expect(mockFacultyRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result).toEqual(updatedService);
    });

    it("should update service with courseId", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        courseId: 2,
      } as UpdateServiceDto;

      const updatedService = {
        ...mockService,
        course: mockCourse,
        ...updateDto,
      };

      mockServiceRepository.findOneByOrFail.mockResolvedValue(mockService);
      mockServiceRepository.merge.mockReturnValue(updatedService);
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockServiceRepository.save.mockResolvedValue(updatedService);

      const result = await service.update(1, updateDto);

      expect(mockCourseRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 2,
      });
      expect(result).toEqual(updatedService);
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

    it("should throw if service to remove not found", async () => {
      mockServiceRepository.findOneByOrFail.mockRejectedValue(
        new Error("Service with id 1 not found"),
      );

      await expect(service.remove(1)).rejects.toThrow(
        "Service with id 1 not found",
      );
    });
  });
});
