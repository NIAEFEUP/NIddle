import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SortOrder } from "@/common/sorting";
import { Course } from "@/courses/entities/course.entity";
import { CreateFacultyDto } from "./dto/create-faculty.dto";
import { UpdateFacultyDto } from "./dto/update-faculty.dto";
import { Faculty } from "./entities/faculty.entity";
import { FacultiesService } from "./faculties.service";

describe("FacultiesService", () => {
  let service: FacultiesService;

  const mockFaculty: Faculty = {
    id: "1",
    name: "Engineering Faculty",
    acronym: "FEUP",
    courses: [],
    events: [],
  };

  const mockCourse: Course = {
    id: "1",
    name: "Computer Science",
    acronym: "CS",
    faculties: [],
    events: [],
  };

  const mockFacultyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    findOneByOrFail: jest.fn(),
    delete: jest.fn(),
  };

  const mockCourseRepository = {
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacultiesService,
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

    service = module.get<FacultiesService>(FacultiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return a paginated response of faculties with default sort", async () => {
      const faculties = [mockFaculty];
      mockFacultyRepository.findAndCount.mockResolvedValue([
        faculties,
        faculties.length,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(faculties);
      expect(result.meta.totalItems).toBe(faculties.length);
      expect(result.meta.totalPages).toBe(1);
      expect(mockFacultyRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ["courses"],
        skip: 0,
        take: 10,
        order: { id: "ASC" },
      });
    });

    it("should filter by courseId and apply sortBy with id tiebreaker", async () => {
      const faculties = [mockFaculty];
      mockFacultyRepository.findAndCount.mockResolvedValue([
        faculties,
        faculties.length,
      ]);

      await service.findAll({
        page: 1,
        limit: 10,
        courseId: "course-123",
        sortBy: "name",
        sortOrder: SortOrder.DESC,
      });

      expect(mockFacultyRepository.findAndCount).toHaveBeenCalledWith({
        where: { courses: { id: "course-123" } },
        relations: ["courses"],
        skip: 0,
        take: 10,
        order: { name: "DESC", id: "ASC" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a faculty by ID", async () => {
      mockFacultyRepository.findOneOrFail.mockResolvedValue(mockFaculty);

      const result = await service.findOne("1");

      expect(result).toEqual(mockFaculty);
      expect(mockFacultyRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["courses"],
      });
    });

    it("should throw if faculty not found", async () => {
      mockFacultyRepository.findOneOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.findOne("1")).rejects.toThrow("Not found");
    });
  });

  describe("create", () => {
    it("should create a faculty without courses", async () => {
      const createFacultyDto: CreateFacultyDto = {
        name: "Engineering Faculty",
        acronym: "FEUP",
      };
      mockFacultyRepository.create.mockReturnValue(mockFaculty);
      mockFacultyRepository.save.mockResolvedValue(mockFaculty);

      const result = await service.create(createFacultyDto);

      expect(result).toEqual(mockFaculty);
      expect(mockFacultyRepository.create).toHaveBeenCalledWith(
        createFacultyDto,
      );
      expect(mockFacultyRepository.save).toHaveBeenCalledWith(mockFaculty);
    });

    it("should create a faculty with valid courses", async () => {
      const createFacultyDto: CreateFacultyDto = {
        name: "Engineering Faculty",
        acronym: "FEUP",
        courseIds: ["1"],
      };
      mockFacultyRepository.create.mockReturnValue({ ...mockFaculty });
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);
      mockFacultyRepository.save.mockResolvedValue({
        ...mockFaculty,
        courses: [mockCourse],
      });

      const result = await service.create(createFacultyDto);

      expect(result.courses).toEqual([mockCourse]);
      expect(mockCourseRepository.findBy).toHaveBeenCalled();
    });

    it("should throw NotFoundException if any course is not found", async () => {
      const createFacultyDto: CreateFacultyDto = {
        name: "Engineering Faculty",
        acronym: "FEUP",
        courseIds: ["1", "2"],
      };
      mockFacultyRepository.create.mockReturnValue(mockFaculty);
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);

      await expect(service.create(createFacultyDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update a faculty successfully", async () => {
      const updateFacultyDto: UpdateFacultyDto = { name: "New Name" };
      mockFacultyRepository.findOneByOrFail.mockResolvedValue({
        ...mockFaculty,
      });
      mockFacultyRepository.save.mockResolvedValue({
        ...mockFaculty,
        name: "New Name",
      });

      const result = await service.update("1", updateFacultyDto);

      expect(result.name).toEqual("New Name");
      expect(mockFacultyRepository.merge).toHaveBeenCalled();
      expect(mockFacultyRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if faculty not found", async () => {
      mockFacultyRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.update("1", {})).rejects.toThrow("Not found");
    });

    it("should update courses if provided", async () => {
      const updateFacultyDto: UpdateFacultyDto = { courseIds: ["1"] };
      mockFacultyRepository.findOneByOrFail.mockResolvedValue({
        ...mockFaculty,
      });
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);
      mockFacultyRepository.save.mockResolvedValue({
        ...mockFaculty,
        courses: [mockCourse],
      });

      const result = await service.update("1", updateFacultyDto);

      expect(result.courses).toEqual([mockCourse]);
    });

    it("should throw NotFoundException if updating with invalid course IDs", async () => {
      const updateFacultyDto: UpdateFacultyDto = { courseIds: ["1", "2"] };
      mockFacultyRepository.findOneByOrFail.mockResolvedValue({
        ...mockFaculty,
      });
      mockCourseRepository.findBy.mockResolvedValue([mockCourse]);

      await expect(service.update("1", updateFacultyDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should clear courses if empty array provided", async () => {
      const updateFacultyDto: UpdateFacultyDto = { courseIds: [] };
      mockFacultyRepository.findOneByOrFail.mockResolvedValue({
        ...mockFaculty,
        courses: [mockCourse],
      });
      mockFacultyRepository.save.mockResolvedValue({
        ...mockFaculty,
        courses: [],
      });

      const result = await service.update("1", updateFacultyDto);

      expect(result.courses).toEqual([]);
    });
  });

  describe("remove", () => {
    it("should remove a faculty", async () => {
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockFacultyRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove("1");

      expect(result).toEqual(mockFaculty);
      expect(mockFacultyRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should throw if faculty not found", async () => {
      mockFacultyRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.remove("1")).rejects.toThrow("Not found");
    });
  });
});
