import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
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
    validateFacultyAndCourses() { },
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
  };

  const mockCourseRepository = {
    findBy: jest.fn(),
  };

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

      const result = await service.findAll({});

      expect(result).toEqual(services);
      expect(mockServiceRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ["faculty", "courses"],
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
        relations: ["faculty", "courses"],
      });
    });

    it("should filter by courseId", async () => {
      const services = [mockService];
      mockServiceRepository.find.mockResolvedValue(services);

      const result = await service.findAll({ courseId: 2 });

      expect(result).toEqual(services);
      expect(mockServiceRepository.find).toHaveBeenCalledWith({
        where: {
          courses: { id: 2 },
        },
        relations: ["faculty", "courses"],
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
          courses: { id: 2 },
        },
        relations: ["faculty", "courses"],
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
        relations: ["faculty", "courses"],
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

      const repo = {
        create: jest.fn().mockReturnValue(createServiceDto),
        save: jest.fn().mockResolvedValue(mockService),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo } as any)),
      );

      const result = await service.create(createServiceDto);

      expect(result).toEqual(mockService);
      expect(repo.create).toHaveBeenCalledWith(createServiceDto);
      expect(repo.save).toHaveBeenCalledWith(createServiceDto);
      expect(mockServiceRepository.manager.transaction).toHaveBeenCalled();
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

      const repo = {
        create: jest.fn().mockReturnValue(createServiceDto),
        save: jest
          .fn()
          .mockResolvedValue({ ...mockService, courses: [mockCourse] }),
      } as unknown as Partial<Repository<Service>>;

      const courseRepo = {
        find: jest.fn().mockResolvedValue([mockCourse]),
      };

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(
          cb({
            getRepository: (entity: any) => {
              if (entity === Service) return repo;
              if (entity === Course) return courseRepo;
              return repo;
            },
          } as any),
        ),
      );

      const result = await service.create(createServiceDto);

      expect(courseRepo.find).toHaveBeenCalledWith({
        where: { id: In([1, 2]) },
      });
      expect(result.course).toEqual([mockCourse]);
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
        merge: jest.fn(),
        save: jest.fn(),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo } as any)),
      );

      const result = await service.update(1, updateDto);

      expect(repo.findOne).toHaveBeenCalledTimes(2);
      expect(repo.merge).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual({ ...mockService, ...updateDto });
    });

    it("should update service with course IDs", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        courseIds: [2, 3],
      } as UpdateServiceDto;

      const updatedService = { ...mockService, ...updateDto };
      const repo = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockService) // before update
          .mockResolvedValueOnce(updatedService), // after update
        merge: jest.fn(),
        save: jest.fn(),
      } as unknown as Partial<Repository<Service>>;

      const courseRepo = {
        find: jest.fn().mockResolvedValue([mockCourse]),
      };

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(
          cb({
            getRepository: (entity: any) => {
              if (entity === Service) return repo;
              if (entity === Course) return courseRepo;
              return repo;
            },
          } as any),
        ),
      );

      const result = await service.update(1, updateDto);

      expect(courseRepo.find).toHaveBeenCalledWith({
        where: { id: In([2, 3]) },
      });
      expect(result).toEqual(updatedService);
    });

    it("should update service with empty course IDs", async () => {
      const updateDto: UpdateServiceDto = {
        name: "Updated name",
        courseIds: [],
      } as UpdateServiceDto;

      const updatedService = { ...mockService, ...updateDto, courses: [] };
      const repo = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockService) // before update
          .mockResolvedValueOnce(updatedService), // after update
        merge: jest.fn(),
        save: jest.fn(),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(
          cb({
            getRepository: (entity: any) => {
              if (entity === Service) return repo;
              return repo;
            },
          } as any),
        ),
      );

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedService);
    });

    it("should throw if service to update not found", async () => {
      const repo = {
        findOne: jest.fn().mockResolvedValue(undefined),
        merge: jest.fn(),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo } as any)),
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
        merge: jest.fn(),
        save: jest.fn(),
      } as unknown as Partial<Repository<Service>>;

      mockServiceRepository.manager.transaction.mockImplementation((cb: TxCb) =>
        Promise.resolve(cb({ getRepository: () => repo } as any)),
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
        relations: { schedule: true } as any,
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
