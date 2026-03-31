import { DataSource, EntityTarget } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { User } from "@/users/entities/user.entity";
import AssociationSeeder from "./6-association.seeder";

describe("AssociationSeeder", () => {
  let seeder: AssociationSeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockAssociationFactory = {
    make: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ id: 1, user: null, faculty: null, course: null }),
      ),
  };

  const mockUserFactory = {
    save: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ id: 1, name: "Test User", email: "test@test.com" }),
      ),
  };

  const mockGet = jest.fn((entity: EntityTarget<unknown>) => {
    if (entity === Association) {
      return mockAssociationFactory;
    } else if (entity === User) {
      return mockUserFactory;
    }
    return {};
  });

  beforeEach(() => {
    seeder = new AssociationSeeder();
    mockGet.mockClear();
    mockAssociationFactory.make.mockClear();
    mockUserFactory.save.mockClear();
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(seeder).toBeDefined();
  });

  it("should seed associations", async () => {
    const mockAssociationRepository = {
      save: jest.fn().mockResolvedValue([]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<unknown>) => {
      if (entity === Association) {
        return mockAssociationRepository;
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

    expect(mockGet).toHaveBeenCalledWith(Association);
    expect(mockGet).toHaveBeenCalledWith(User);
    expect(mockAssociationFactory.make).toHaveBeenCalledTimes(5);
    expect(mockUserFactory.save).toHaveBeenCalledTimes(5);
    expect(mockAssociationRepository.save).toHaveBeenCalled();
  });

  it("should assign faculty when faculties exist", async () => {
    const mockFaculty = { id: 1, name: "Test Faculty" };
    const mockAssociation = { id: 1, user: null, faculty: null, course: null };

    const mockAssociationRepository = {
      save: jest.fn().mockResolvedValue([mockAssociation]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([mockFaculty]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<unknown>) => {
      if (entity === Association) {
        return mockAssociationRepository;
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

    mockAssociationFactory.make.mockResolvedValue(mockAssociation);

    jest
      .spyOn(require("@faker-js/faker").faker.number, "int")
      .mockReturnValue(0);

    await seeder.run(dataSource, factoryManager);

    expect(mockAssociation.faculty).toBe(mockFaculty);
  });

  it("should optionally assign course when courses exist and boolean is true", async () => {
    const mockFaculty = { id: 1, name: "Test Faculty" };
    const mockCourse = { id: 1, name: "Test Course" };
    const mockAssociation = { id: 1, user: null, faculty: null, course: null };

    const mockAssociationRepository = {
      save: jest.fn().mockResolvedValue([mockAssociation]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([mockFaculty]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([mockCourse]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<unknown>) => {
      if (entity === Association) {
        return mockAssociationRepository;
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

    mockAssociationFactory.make.mockResolvedValue(mockAssociation);

    jest
      .spyOn(require("@faker-js/faker").faker.number, "int")
      .mockReturnValue(0);
    jest
      .spyOn(require("@faker-js/faker").faker.datatype, "boolean")
      .mockReturnValue(true);

    await seeder.run(dataSource, factoryManager);

    expect(mockAssociation.course).toBe(mockCourse);
  });

  it("should not assign course when boolean is false", async () => {
    const mockFaculty = { id: 1, name: "Test Faculty" };
    const mockCourse = { id: 1, name: "Test Course" };
    const mockAssociation = { id: 1, user: null, faculty: null, course: null };

    const mockAssociationRepository = {
      save: jest.fn().mockResolvedValue([mockAssociation]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([mockFaculty]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([mockCourse]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<unknown>) => {
      if (entity === Association) {
        return mockAssociationRepository;
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

    mockAssociationFactory.make.mockResolvedValue(mockAssociation);

    jest
      .spyOn(require("@faker-js/faker").faker.number, "int")
      .mockReturnValue(0);
    jest
      .spyOn(require("@faker-js/faker").faker.datatype, "boolean")
      .mockReturnValue(false);

    await seeder.run(dataSource, factoryManager);

    expect(mockAssociation.course).toBeNull();
  });

  it("should not assign faculty when faculties array is empty", async () => {
    const mockAssociation = { id: 1, user: null, faculty: null, course: null };

    const mockAssociationRepository = {
      save: jest.fn().mockResolvedValue([mockAssociation]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<unknown>) => {
      if (entity === Association) {
        return mockAssociationRepository;
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

    mockAssociationFactory.make.mockResolvedValue(mockAssociation);

    await seeder.run(dataSource, factoryManager);

    expect(mockAssociation.faculty).toBeNull();
  });

  it("should create a unique user for each association", async () => {
    const mockAssociationRepository = {
      save: jest.fn().mockResolvedValue([]),
    };

    const mockFacultyRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const mockCourseRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<unknown>) => {
      if (entity === Association) {
        return mockAssociationRepository;
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

    // 5 associations should create 5 users
    expect(mockUserFactory.save).toHaveBeenCalledTimes(5);
  });
});
