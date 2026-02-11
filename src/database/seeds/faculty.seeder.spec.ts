import { Course } from "@courses/entities/course.entity";
import { Faculty } from "@faculties/entities/faculty.entity";
import { DataSource, EntityTarget } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import FacultySeeder from "./2-faculty.seeder";

describe("FacultySeeder", () => {
  let seeder: FacultySeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockFaculties = Array.from({ length: 10 }, () => new Faculty());
  const mockCourses = Array.from({ length: 5 }, () => new Course());

  const mockFacultyFactory = {
    saveMany: jest.fn().mockResolvedValue(mockFaculties),
  };

  const mockFacultyRepo = {
    save: jest.fn() as jest.Mock<Promise<Faculty>, [Faculty]>,
  };

  const mockCourseRepo = {
    find: jest.fn(),
  };

  const mockGet = jest.fn().mockReturnValue(mockFacultyFactory);
  const mockGetRepository = jest.fn((entity: EntityTarget<any>) => {
    if (entity === Faculty) return mockFacultyRepo;
    if (entity === Course) return mockCourseRepo;
    return undefined;
  });

  beforeEach(() => {
    seeder = new FacultySeeder();

    dataSource = {
      getRepository: (entity: EntityTarget<any>) =>
        mockGetRepository(entity) as object,
    } as unknown as DataSource;

    factoryManager = {
      get: (entity: EntityTarget<any>) => mockGet(entity) as object,
    } as unknown as SeederFactoryManager;

    mockFacultyRepo.save.mockClear();
    mockCourseRepo.find.mockReset();
    mockFacultyFactory.saveMany.mockClear();
    mockGet.mockClear();
    mockGetRepository.mockClear();
  });

  it("should be defined", () => {
    expect(seeder).toBeDefined();
  });

  it("should seed faculties and assign courses if courses exist", async () => {
    mockCourseRepo.find.mockResolvedValue(mockCourses);

    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(Faculty);
    expect(mockFacultyFactory.saveMany).toHaveBeenCalledWith(10);
    expect(mockGetRepository).toHaveBeenCalledWith(Course);
    expect(mockCourseRepo.find).toHaveBeenCalled();
    expect(mockGetRepository).toHaveBeenCalledWith(Faculty);

    expect(mockFacultyRepo.save).toHaveBeenCalledTimes(10);

    const savedFaculty = mockFacultyRepo.save.mock.calls[0][0];
    expect(savedFaculty.courses).toBeDefined();
    expect(Array.isArray(savedFaculty.courses)).toBe(true);
  });

  it("should seed faculties but not assign courses if no courses exist", async () => {
    mockCourseRepo.find.mockResolvedValue([]);

    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(Faculty);
    expect(mockFacultyFactory.saveMany).toHaveBeenCalledWith(10);
    expect(mockCourseRepo.find).toHaveBeenCalled();

    expect(mockFacultyRepo.save).not.toHaveBeenCalled();
  });
});
