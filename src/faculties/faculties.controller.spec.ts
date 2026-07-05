import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateFacultyDto } from "./dto/create-faculty.dto";
import { UpdateFacultyDto } from "./dto/update-faculty.dto";
import { Faculty } from "./entities/faculty.entity";
import { FacultiesController } from "./faculties.controller";
import { FacultiesService } from "./faculties.service";

describe("FacultiesController", () => {
  let controller: FacultiesController;

  const mockFaculty: Faculty = {
    id: 1,
    name: "Engineering Faculty",
    acronym: "FEUP",
    courses: [],
    events: [],
  };

  const mockFacultiesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultiesController],
      providers: [
        {
          provide: FacultiesService,
          useValue: mockFacultiesService,
        },
      ],
    }).compile();

    controller = module.get<FacultiesController>(FacultiesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of faculties", async () => {
      const faculties = [mockFaculty];
      mockFacultiesService.findAll.mockResolvedValue(faculties);

      const result = await controller.findAll();

      expect(result).toEqual(faculties);
      expect(mockFacultiesService.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a single faculty", async () => {
      mockFacultiesService.findOne.mockResolvedValue(mockFaculty);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockFaculty);
      expect(mockFacultiesService.findOne).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if faculty not found", async () => {
      mockFacultiesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
      expect(mockFacultiesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe("create", () => {
    it("should create a new faculty", async () => {
      const createFacultyDto: CreateFacultyDto = {
        name: "Engineering Faculty",
        acronym: "FEUP",
        courseIds: [1, 2],
      };
      mockFacultiesService.create.mockResolvedValue(mockFaculty);

      const result = await controller.create(createFacultyDto);

      expect(result).toEqual(mockFaculty);
      expect(mockFacultiesService.create).toHaveBeenCalledWith(
        createFacultyDto,
      );
    });
  });

  describe("update", () => {
    it("should update a faculty", async () => {
      const updateFacultyDto: UpdateFacultyDto = {
        name: "Updated Faculty Name",
      };
      const updatedFaculty = { ...mockFaculty, ...updateFacultyDto };
      mockFacultiesService.update.mockResolvedValue(updatedFaculty);

      const result = await controller.update(1, updateFacultyDto);

      expect(result).toEqual(updatedFaculty);
      expect(mockFacultiesService.update).toHaveBeenCalledWith(
        1,
        updateFacultyDto,
      );
    });

    it("should throw NotFoundException if faculty not found", async () => {
      const updateFacultyDto: UpdateFacultyDto = {
        name: "Updated Faculty Name",
      };
      mockFacultiesService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(1, updateFacultyDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockFacultiesService.update).toHaveBeenCalledWith(
        1,
        updateFacultyDto,
      );
    });
  });

  describe("remove", () => {
    it("should remove a faculty", async () => {
      mockFacultiesService.remove.mockResolvedValue(mockFaculty);

      const result = await controller.remove(1);

      expect(result).toEqual(mockFaculty);
      expect(mockFacultiesService.remove).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if faculty not found", async () => {
      mockFacultiesService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockFacultiesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
