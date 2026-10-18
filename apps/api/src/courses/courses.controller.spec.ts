import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { SortOrder } from "@/common/sorting";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { CourseFilterDto } from "./dto/course-filter.dto";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { Course } from "./entities/course.entity";

describe("CoursesController", () => {
  let controller: CoursesController;

  const mockCourse: Course = {
    id: "1",
    name: "Computer Science",
    acronym: "CS",
    faculties: [],
    events: [],
  };

  const mockCoursesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return a paginated response of courses", async () => {
      const response = {
        data: [mockCourse],
        meta: {
          page: 1,
          limit: 10,
          itemCount: 1,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
      mockCoursesService.findAll.mockResolvedValue(response);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(response);
      expect(mockCoursesService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it("should pass filtering and sorting params to service", async () => {
      const response = {
        data: [mockCourse],
        meta: {
          page: 1,
          limit: 10,
          itemCount: 1,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
      mockCoursesService.findAll.mockResolvedValue(response);

      const filters: CourseFilterDto = {
        page: 1,
        limit: 10,
        facultyId: "fac-1",
        sortBy: "name",
        sortOrder: SortOrder.ASC,
      };
      const result = await controller.findAll(filters);

      expect(result).toEqual(response);
      expect(mockCoursesService.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe("findOne", () => {
    it("should return a single course", async () => {
      mockCoursesService.findOne.mockResolvedValue(mockCourse);

      const result = await controller.findOne("1");

      expect(result).toEqual(mockCourse);
      expect(mockCoursesService.findOne).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException if course not found", async () => {
      mockCoursesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne("1")).rejects.toThrow(NotFoundException);
      expect(mockCoursesService.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("create", () => {
    it("should create a new course", async () => {
      const createCourseDto: CreateCourseDto = {
        name: "Computer Science",
        acronym: "CS",
        facultyIds: [
          "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
        ],
      };
      mockCoursesService.create.mockResolvedValue(mockCourse);

      const result = await controller.create(createCourseDto);

      expect(result).toEqual(mockCourse);
      expect(mockCoursesService.create).toHaveBeenCalledWith(createCourseDto);
    });
  });

  describe("update", () => {
    it("should update a course", async () => {
      const updateCourseDto: UpdateCourseDto = {
        name: "Updated Course Name",
      };
      const updatedCourse = { ...mockCourse, ...updateCourseDto };
      mockCoursesService.update.mockResolvedValue(updatedCourse);

      const result = await controller.update("1", updateCourseDto);

      expect(result).toEqual(updatedCourse);
      expect(mockCoursesService.update).toHaveBeenCalledWith(
        "1",
        updateCourseDto,
      );
    });

    it("should throw NotFoundException if course not found", async () => {
      const updateCourseDto: UpdateCourseDto = {
        name: "Updated Course Name",
      };
      mockCoursesService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update("1", updateCourseDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCoursesService.update).toHaveBeenCalledWith(
        "1",
        updateCourseDto,
      );
    });
  });

  describe("remove", () => {
    it("should remove a course", async () => {
      mockCoursesService.remove.mockResolvedValue(mockCourse);

      const result = await controller.remove("1");

      expect(result).toEqual(mockCourse);
      expect(mockCoursesService.remove).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException if course not found", async () => {
      mockCoursesService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove("1")).rejects.toThrow(NotFoundException);
      expect(mockCoursesService.remove).toHaveBeenCalledWith("1");
    });
  });
});
