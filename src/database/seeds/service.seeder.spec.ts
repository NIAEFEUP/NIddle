import { DataSource, EntityTarget } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Service } from "@/services/entity/service.entity";
import ServiceSeeder from "./5-service.seeder";

describe("ServiceSeeder", () => {
  let seeder: ServiceSeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockFactory = {
    saveMany: jest.fn(),
  };

  const mockGet = jest.fn().mockReturnValue(mockFactory);

  beforeEach(() => {
    seeder = new ServiceSeeder();
    mockGet.mockClear();
    mockFactory.saveMany.mockClear();
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(seeder).toBeDefined();
  });

  it("should seed services", async () => {
    const mockServiceRepository = {
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue([]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<any>) => {
      if (entity === Service) {
        return mockServiceRepository;
      } else if (entity === Faculty) {
        return mockFacultyRepository;
      } else if (entity === Course) {
        return mockCourseRepository;
      }
    });

    dataSource = {
      getRepository: getRepositoryMock,
    } as unknown as DataSource;

    factoryManager = {
      get: mockGet,
    } as unknown as SeederFactoryManager;

    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(Service);
    expect(mockFactory.saveMany).toHaveBeenCalledWith(10);
    expect(mockServiceRepository.save).toHaveBeenCalled();
  });

  it("should assign course relation when relType is 0 and courses exist", async () => {
    const mockCourse = { id: 1, name: "Test Course" };
    const mockService = { id: 1, course: null, faculty: null };

    const mockServiceRepository = {
      find: jest.fn().mockResolvedValue([mockService]),
      save: jest.fn().mockResolvedValue([mockService]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([mockCourse]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<any>) => {
      if (entity === Service) {
        return mockServiceRepository;
      } else if (entity === Faculty) {
        return mockFacultyRepository;
      } else if (entity === Course) {
        return mockCourseRepository;
      }
    });

    dataSource = {
      getRepository: getRepositoryMock,
    } as unknown as DataSource;

    factoryManager = {
      get: mockGet,
    } as unknown as SeederFactoryManager;

    jest
      .spyOn(require("@faker-js/faker").faker.number, "int")
      .mockReturnValueOnce(0);

    await seeder.run(dataSource, factoryManager);

    expect(mockService.course).toBe(mockCourse);
  });

  it("should assign faculty relation when relType is 1 and faculties exist", async () => {
    const mockFaculty = { id: 1, name: "Test Faculty" };
    const mockService = { id: 1, course: null, faculty: null };

    const mockServiceRepository = {
      find: jest.fn().mockResolvedValue([mockService]),
      save: jest.fn().mockResolvedValue([mockService]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([mockFaculty]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<any>) => {
      if (entity === Service) {
        return mockServiceRepository;
      } else if (entity === Faculty) {
        return mockFacultyRepository;
      } else if (entity === Course) {
        return mockCourseRepository;
      }
    });

    dataSource = {
      getRepository: getRepositoryMock,
    } as unknown as DataSource;

    factoryManager = {
      get: mockGet,
    } as unknown as SeederFactoryManager;

    jest
      .spyOn(require("@faker-js/faker").faker.number, "int")
      .mockReturnValueOnce(1);

    await seeder.run(dataSource, factoryManager);

    expect(mockService.faculty).toBe(mockFaculty);
  });

  it("should not assign course when courses array is empty", async () => {
    const mockService = { id: 1, course: null, faculty: null };

    const mockServiceRepository = {
      find: jest.fn().mockResolvedValue([mockService]),
      save: jest.fn().mockResolvedValue([mockService]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<any>) => {
      if (entity === Service) {
        return mockServiceRepository;
      } else if (entity === Faculty) {
        return mockFacultyRepository;
      } else if (entity === Course) {
        return mockCourseRepository;
      }
    });

    dataSource = {
      getRepository: getRepositoryMock,
    } as unknown as DataSource;

    factoryManager = {
      get: mockGet,
    } as unknown as SeederFactoryManager;

    jest
      .spyOn(require("@faker-js/faker").faker.number, "int")
      .mockReturnValueOnce(0);

    await seeder.run(dataSource, factoryManager);

    expect(mockService.course).toBeNull();
  });

  it("should not assign faculty when faculties array is empty", async () => {
    const mockService = { id: 1, course: null, faculty: null };

    const mockServiceRepository = {
      find: jest.fn().mockResolvedValue([mockService]),
      save: jest.fn().mockResolvedValue([mockService]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<any>) => {
      if (entity === Service) {
        return mockServiceRepository;
      } else if (entity === Faculty) {
        return mockFacultyRepository;
      } else if (entity === Course) {
        return mockCourseRepository;
      }
    });

    dataSource = {
      getRepository: getRepositoryMock,
    } as unknown as DataSource;

    factoryManager = {
      get: mockGet,
    } as unknown as SeederFactoryManager;

    jest
      .spyOn(require("@faker-js/faker").faker.number, "int")
      .mockReturnValueOnce(1);

    await seeder.run(dataSource, factoryManager);

    expect(mockService.faculty).toBeNull();
  });
});
