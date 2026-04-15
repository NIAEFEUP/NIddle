import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { User } from "@/users/entities/user.entity";
import { AssociationsService } from "./associations.service";
import { AssociationFilterDto } from "./dto/association-filter.dto";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { Association } from "./entities/association.entity";

describe("AssociationsService", () => {
  let service: AssociationsService;

  const mockFaculty: Faculty = {
    id: 1,
    name: "Engineering Faculty",
    acronym: "FEUP",
    courses: [],
    events: [],
    associations: [],
  };

  const mockUser: User = {
    id: 1,
    name: "Chess Club Admin",
    email: "chess@example.com",
    password: "hashedpassword",
  };

  const mockCourse: Course = {
    id: 1,
    name: "Computer Science",
    acronym: "CS",
    faculties: [],
    events: [],
    association: null,
  };

  const mockAssociation: Association = {
    id: 1,
    name: "Chess Club",
    faculty: mockFaculty,
    user: mockUser,
    course: null,
    events: [],
    ownerServices: [],
    managerServices: [],
  };

  const mockAssociationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockFacultyRepository = {
    findOneByOrFail: jest.fn(),
  };

  const mockUserRepository = {
    findOneByOrFail: jest.fn(),
  };

  const mockCourseRepository = {
    findOneByOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationsService,
        {
          provide: getRepositoryToken(Association),
          useValue: mockAssociationRepository,
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockFacultyRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
      ],
    }).compile();

    service = module.get<AssociationsService>(AssociationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an association without course", async () => {
      const createDto: CreateAssociationDto = {
        name: "Chess Club",
        facultyId: 1,
        userId: 1,
      };
      mockAssociationRepository.create.mockReturnValue({ ...mockAssociation });
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockUserRepository.findOneByOrFail.mockResolvedValue(mockUser);
      mockAssociationRepository.save.mockResolvedValue(mockAssociation);

      const result = await service.create(createDto);

      expect(result).toEqual(mockAssociation);
      expect(mockAssociationRepository.create).toHaveBeenCalledWith({
        name: "Chess Club",
      });
      expect(mockFacultyRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(mockUserRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(mockAssociationRepository.save).toHaveBeenCalled();
    });

    it("should create an association with course", async () => {
      const createDto: CreateAssociationDto = {
        name: "Chess Club",
        facultyId: 1,
        userId: 1,
        courseId: 1,
      };
      mockAssociationRepository.create.mockReturnValue({ ...mockAssociation });
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockUserRepository.findOneByOrFail.mockResolvedValue(mockUser);
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockAssociationRepository.save.mockResolvedValue({
        ...mockAssociation,
        course: mockCourse,
      });

      const result = await service.create(createDto);

      expect(result.course).toEqual(mockCourse);
      expect(mockCourseRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
    });

    it("should throw if faculty not found", async () => {
      const createDto: CreateAssociationDto = {
        name: "Chess Club",
        facultyId: 999,
        userId: 1,
      };
      mockAssociationRepository.create.mockReturnValue({ ...mockAssociation });
      mockFacultyRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.create(createDto)).rejects.toThrow("Not found");
    });

    it("should throw if user not found", async () => {
      const createDto: CreateAssociationDto = {
        name: "Chess Club",
        facultyId: 1,
        userId: 999,
      };
      mockAssociationRepository.create.mockReturnValue({ ...mockAssociation });
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(mockFaculty);
      mockUserRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.create(createDto)).rejects.toThrow("Not found");
    });
  });

  describe("findAll", () => {
    it("should return all associations without filters", async () => {
      const associations = [mockAssociation];
      const filters: AssociationFilterDto = {};
      mockAssociationRepository.find.mockResolvedValue(associations);

      const result = await service.findAll(filters);

      expect(result).toEqual(associations);
      expect(mockAssociationRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ["faculty", "user", "course"],
      });
    });

    it("should return associations filtered by faculty", async () => {
      const associations = [mockAssociation];
      const filters: AssociationFilterDto = { facultyId: 1 };
      mockAssociationRepository.find.mockResolvedValue(associations);

      const result = await service.findAll(filters);

      expect(result).toEqual(associations);
      expect(mockAssociationRepository.find).toHaveBeenCalledWith({
        where: { faculty: { id: 1 } },
        relations: ["faculty", "user", "course"],
      });
    });

    it("should return associations filtered by course", async () => {
      const associations = [mockAssociation];
      const filters: AssociationFilterDto = { courseId: 2 };
      mockAssociationRepository.find.mockResolvedValue(associations);

      const result = await service.findAll(filters);

      expect(result).toEqual(associations);
      expect(mockAssociationRepository.find).toHaveBeenCalledWith({
        where: { course: { id: 2 } },
        relations: ["faculty", "user", "course"],
      });
    });

    it("should return associations filtered by both faculty and course", async () => {
      const associations = [mockAssociation];
      const filters: AssociationFilterDto = { facultyId: 1, courseId: 2 };
      mockAssociationRepository.find.mockResolvedValue(associations);

      const result = await service.findAll(filters);

      expect(result).toEqual(associations);
      expect(mockAssociationRepository.find).toHaveBeenCalledWith({
        where: { faculty: { id: 1 }, course: { id: 2 } },
        relations: ["faculty", "user", "course"],
      });
    });
  });

  describe("findOne", () => {
    it("should return an association by ID", async () => {
      mockAssociationRepository.findOneOrFail.mockResolvedValue(
        mockAssociation,
      );

      const result = await service.findOne(1);

      expect(result).toEqual(mockAssociation);
      expect(mockAssociationRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["faculty", "user", "course"],
      });
    });

    it("should throw if association not found", async () => {
      mockAssociationRepository.findOneOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.findOne(999)).rejects.toThrow("Not found");
    });
  });

  describe("update", () => {
    it("should update an association successfully", async () => {
      const updateDto: UpdateAssociationDto = { name: "Drama Club" };
      mockAssociationRepository.findOneOrFail.mockResolvedValue({
        ...mockAssociation,
      });
      mockAssociationRepository.save.mockResolvedValue({
        ...mockAssociation,
        name: "Drama Club",
      });

      const result = await service.update(1, updateDto);

      expect(result.name).toEqual("Drama Club");
      expect(mockAssociationRepository.merge).toHaveBeenCalled();
      expect(mockAssociationRepository.save).toHaveBeenCalled();
    });

    it("should throw if association not found", async () => {
      mockAssociationRepository.findOneOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.update(999, {})).rejects.toThrow("Not found");
    });

    it("should update faculty if provided", async () => {
      const newFaculty: Faculty = {
        ...mockFaculty,
        id: 2,
        name: "Science Faculty",
      };
      const updateDto: UpdateAssociationDto = { facultyId: 2 };
      mockAssociationRepository.findOneOrFail.mockResolvedValue({
        ...mockAssociation,
      });
      mockFacultyRepository.findOneByOrFail.mockResolvedValue(newFaculty);
      mockAssociationRepository.save.mockResolvedValue({
        ...mockAssociation,
        faculty: newFaculty,
      });

      const result = await service.update(1, updateDto);

      expect(result.faculty).toEqual(newFaculty);
      expect(mockFacultyRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 2,
      });
    });

    it("should update user if provided", async () => {
      const newUser: User = { ...mockUser, id: 2, name: "New Admin" };
      const updateDto: UpdateAssociationDto = { userId: 2 };
      mockAssociationRepository.findOneOrFail.mockResolvedValue({
        ...mockAssociation,
      });
      mockUserRepository.findOneByOrFail.mockResolvedValue(newUser);
      mockAssociationRepository.save.mockResolvedValue({
        ...mockAssociation,
        user: newUser,
      });

      const result = await service.update(1, updateDto);

      expect(result.user).toEqual(newUser);
      expect(mockUserRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 2,
      });
    });

    it("should update course if provided", async () => {
      const updateDto: UpdateAssociationDto = { courseId: 1 };
      mockAssociationRepository.findOneOrFail.mockResolvedValue({
        ...mockAssociation,
      });
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockAssociationRepository.save.mockResolvedValue({
        ...mockAssociation,
        course: mockCourse,
      });

      const result = await service.update(1, updateDto);

      expect(result.course).toEqual(mockCourse);
      expect(mockCourseRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
    });
  });

  describe("remove", () => {
    it("should remove an association", async () => {
      mockAssociationRepository.findOneByOrFail.mockResolvedValue(
        mockAssociation,
      );
      mockAssociationRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual(mockAssociation);
      expect(mockAssociationRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw if association not found", async () => {
      mockAssociationRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.remove(999)).rejects.toThrow("Not found");
    });
  });
});
