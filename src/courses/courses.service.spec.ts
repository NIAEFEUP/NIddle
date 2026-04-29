import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { Course } from "./entities/course.entity";

describe("CoursesService", () => {
  let service: CoursesService;

  const mockCourse: Course = {
    id: 1,
    defaultLanguage: "en",
    translations: [
      {
        id: 1,
        courseId: 1,
        languageCode: "en",
        name: "Computer Science",
        acronym: "CS",
        course: undefined as any,
      },
    ],
    faculties: [],
    events: [],
  };

  const mockFaculty: Faculty = {
    id: 1,
    defaultLanguage: "en",
    translations: [
      {
        id: 1,
        facultyId: 1,
        languageCode: "en",
        name: "Engineering Faculty",
        acronym: "FEUP",
        faculty: undefined as any,
      },
    ],
    courses: [],
    events: [],
  };

  const mockCourseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    findOneByOrFail: jest.fn(),
    delete: jest.fn(),
  };

  const mockFacultyRepository = {
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockFacultyRepository,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of courses", async () => {
      const courses = [mockCourse];
      mockCourseRepository.find.mockResolvedValue(courses);

      const result = await service.findAll();

      expect(result).toEqual(courses);
      expect(mockCourseRepository.find).toHaveBeenCalledWith({
        relations: ["translations", "faculties"],
      });
    });
  });

  describe("findOne", () => {
    it("should return a course by ID", async () => {
      mockCourseRepository.findOneOrFail.mockResolvedValue(mockCourse);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCourse);
      expect(mockCourseRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["translations", "faculties"],
      });
    });

    it("should throw if course not found", async () => {
      mockCourseRepository.findOneOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.findOne(1)).rejects.toThrow("Not found");
    });
  });

  describe("create", () => {
    it("should create a course without faculties", async () => {
      const createCourseDto: CreateCourseDto = {
        translations: [
          { languageCode: "en", name: "Computer Science", acronym: "CS" },
        ],
      };
      mockCourseRepository.save.mockResolvedValue(mockCourse);

      const result = await service.create(createCourseDto);

      expect(result).toEqual(mockCourse);
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });

    it("should create a course without translations", async () => {
      const createCourseDto: CreateCourseDto = {} as CreateCourseDto;
      mockCourseRepository.save.mockResolvedValue(mockCourse);

      const result = await service.create(createCourseDto);

      expect(result).toEqual(mockCourse);
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });

    it("should create a course with empty translations array", async () => {
      const createCourseDto: CreateCourseDto = {
        translations: [],
      };
      mockCourseRepository.save.mockResolvedValue(mockCourse);

      const result = await service.create(createCourseDto);

      expect(result).toEqual(mockCourse);
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });

    it("should create a course with valid faculties", async () => {
      const createCourseDto: CreateCourseDto = {
        translations: [
          { languageCode: "en", name: "Computer Science", acronym: "CS" },
        ],
        facultyIds: [1],
      };
      mockCourseRepository.create.mockReturnValue({ ...mockCourse });
      mockFacultyRepository.findBy.mockResolvedValue([mockFaculty]);
      mockCourseRepository.save.mockResolvedValue({
        ...mockCourse,
        faculties: [mockFaculty],
      });

      const result = await service.create(createCourseDto);

      expect(result.faculties).toEqual([mockFaculty]);
      expect(mockFacultyRepository.findBy).toHaveBeenCalled();
    });

    it("should throw NotFoundException if any faculty is not found", async () => {
      const createCourseDto: CreateCourseDto = {
        translations: [
          { languageCode: "en", name: "Computer Science", acronym: "CS" },
        ],
        facultyIds: [1, 2],
      };
      mockCourseRepository.create.mockReturnValue(mockCourse);
      mockFacultyRepository.findBy.mockResolvedValue([mockFaculty]);

      await expect(service.create(createCourseDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update a course successfully", async () => {
      const updateCourseDto: UpdateCourseDto = {
        translations: [{ languageCode: "en", name: "New Name", acronym: "CS" }],
      };
      mockCourseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });
      mockCourseRepository.save.mockResolvedValue({ ...mockCourse });

      const result = await service.update(1, updateCourseDto);

      expect(result).toBeDefined();
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if course not found", async () => {
      mockCourseRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.update(1, {})).rejects.toThrow("Not found");
    });

    it("should update faculties if provided", async () => {
      const updateCourseDto: UpdateCourseDto = { facultyIds: [1] };
      mockCourseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });
      mockFacultyRepository.findBy.mockResolvedValue([mockFaculty]);
      mockCourseRepository.save.mockResolvedValue({
        ...mockCourse,
        faculties: [mockFaculty],
      });

      const result = await service.update(1, updateCourseDto);

      expect(result.faculties).toEqual([mockFaculty]);
    });

    it("should throw NotFoundException if updating with invalid faculty IDs", async () => {
      const updateCourseDto: UpdateCourseDto = { facultyIds: [1, 2] };
      mockCourseRepository.findOneByOrFail.mockResolvedValue({ ...mockCourse });
      mockFacultyRepository.findBy.mockResolvedValue([mockFaculty]);

      await expect(service.update(1, updateCourseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should clear faculties if empty array provided", async () => {
      const updateCourseDto: UpdateCourseDto = { facultyIds: [] };
      mockCourseRepository.findOneByOrFail.mockResolvedValue({
        ...mockCourse,
        faculties: [mockFaculty],
      });
      mockCourseRepository.save.mockResolvedValue({
        ...mockCourse,
        faculties: [],
      });

      const result = await service.update(1, updateCourseDto);

      expect(result.faculties).toEqual([]);
    });
  });

  describe("remove", () => {
    it("should remove a course", async () => {
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockCourseRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual(mockCourse);
      expect(mockCourseRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw if course not found (findOneByOrFail throws)", async () => {
      mockCourseRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.remove(1)).rejects.toThrow("Not found");
    });
  });
});
