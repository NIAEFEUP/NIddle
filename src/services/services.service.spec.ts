import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./entity/service.entity";
import { EnumDays, TimeInterval } from "./entity/timeInterval.entity";
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

  const mockSchedule: TimeInterval[] = [];

  const mockService: Service = {
    id: 1,
    name: "Papelaria D. Beatriz",
    email: "PdB@gmail.com",
    location: "B-142",
    phoneNumber: "+315 999999999",
    schedule: mockSchedule,
    faculty: mockFaculty,
    course: mockCourse,
  };

  const mockTimeInterval: TimeInterval = {
    id: 1,
    startTime: new Date("1970-01-01T09:00:00Z"),
    endTime: new Date("1970-01-01T17:00:00Z"),
    dayOfWeek: EnumDays.MONDAY,
    service: mockService,
  };

  mockSchedule.push(mockTimeInterval);

  // attach the time interval to the schedule (prevents unused-variable lint)
  // assign a schedule property dynamically (not present on TimeInterval type)
  (mockTimeInterval as any).schedule = null;
  mockSchedule.push(mockTimeInterval);

  const mockServiceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockFacultyRepository = {
    findBy: jest.fn(),
  };

  const mockCourseRepository = {
    findBy: jest.fn(),
  };

  // transaction callback type for typing mocks (use any to avoid complex generics)
  type TxCb = (manager: {
    getRepository: (e: any) => Partial<Repository<any>>;
  }) => Promise<any>;

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

      const result = await service.findAll();

      expect(result).toEqual(services);
      expect(mockServiceRepository.find).toHaveBeenCalledWith({
        relations: ({ schedule: { timeIntervals: true } } as any),
      });
    });
  });

  describe("findOne", () => {
    it("should return a service by ID", async () => {
      mockServiceRepository.findOne.mockResolvedValue(mockService);

      const result = await service.findOne(1);

      expect(result).toEqual(mockService);
      expect(mockServiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ({ schedule: { timeIntervals: true } } as any),
      });
    });

    it("should throw if service not found", async () => {
      mockServiceRepository.findOne.mockResolvedValue(undefined);

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
      };

      // prepare a repository that will be returned by manager.getRepository
      const repo = {
        create: jest.fn().mockReturnValue(createServiceDto),
        save: jest.fn().mockResolvedValue(mockService),
      } as unknown as Partial<Repository<Service>>;

      // transaction implementation should call the callback with a manager
      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo })),
      );

      const result = await service.create(createServiceDto);

      expect(result).toEqual(mockService);
      expect(repo.create).toHaveBeenCalledWith(createServiceDto);
      expect(repo.save).toHaveBeenCalledWith(createServiceDto);
      expect(mockServiceRepository.manager.transaction).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update and return the updated service", async () => {
      const updateDto: UpdateServiceDto = {
        name: "New name",
      } as UpdateServiceDto;

      const repo = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockService) // before update
          .mockResolvedValueOnce({ ...mockService, ...updateDto }), // after update
        update: jest.fn().mockResolvedValue(undefined),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo })),
      );

      const result = await service.update(1, updateDto);

      expect(repo.findOne).toHaveBeenCalledTimes(2);
      expect(repo.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({ ...mockService, ...updateDto });
    });

    it("should throw if service to update not found", async () => {
      const repo = {
        findOne: jest.fn().mockResolvedValue(undefined),
        update: jest.fn(),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo })),
      );

      await expect(
        service.update(1, { name: "x" } as UpdateServiceDto),
      ).rejects.toThrow("Service with id 1 not found");
    });

    it("should throw if service not found after update", async () => {
      const repo = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockService) // exists before update
          .mockResolvedValueOnce(undefined), // missing after update
        update: jest.fn().mockResolvedValue(undefined),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo })),
      );

      await expect(
        service.update(1, { name: "x" } as UpdateServiceDto),
      ).rejects.toThrow("Service with id 1 not found after update");
    });
  });

  describe("remove", () => {
    it("should remove and return the deleted service", async () => {
      const repo = {
        findOne: jest.fn().mockResolvedValue(mockService),
        delete: jest.fn().mockResolvedValue(undefined),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo })),
      );

      const result = await service.remove(1);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ({ schedule: { timeIntervals: true } } as any),
      });
      expect(repo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockService);
    });

    it("should throw if service to remove not found", async () => {
      const repo = {
        findOne: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn(),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo })),
      );

      await expect(service.remove(1)).rejects.toThrow(
        "Service with id 1 not found",
      );
    });
  });
});
