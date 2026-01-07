import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Faculty } from '../faculties/entities/faculty.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepository: Repository<Course>;
  let facultyRepository: Repository<Faculty>;

  const mockCourse: Course = {
    id: 1,
    name: 'Computer Science',
    acronym: 'CS',
    faculties: [],
  };

  const mockFaculty: Faculty = {
    id: 1,
    name: 'Engineering Faculty',
    acronym: 'FEUP',
    courses: [],
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
    courseRepository = module.get<Repository<Course>>(
      getRepositoryToken(Course),
    );
    facultyRepository = module.get<Repository<Faculty>>(
      getRepositoryToken(Faculty),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      const courses = [mockCourse];
      mockCourseRepository.find.mockResolvedValue(courses);

      const result = await service.findAll();

      expect(result).toEqual(courses);
      expect(courseRepository.find).toHaveBeenCalledWith({
        relations: ['faculties'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a course by ID', async () => {
      mockCourseRepository.findOneOrFail.mockResolvedValue(mockCourse);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCourse);
      expect(courseRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['faculties'],
      });
    });

    it('should throw if course not found', async () => {
      mockCourseRepository.findOneOrFail.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.findOne(1)).rejects.toThrow('Not found');
    });
  });

  describe('create', () => {
    it('should create a course without faculties', async () => {
      const createCourseDto: CreateCourseDto = {
        name: 'Computer Science',
        acronym: 'CS',
      };
      mockCourseRepository.create.mockReturnValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue(mockCourse);

      const result = await service.create(createCourseDto);

      expect(result).toEqual(mockCourse);
      expect(courseRepository.create).toHaveBeenCalledWith(createCourseDto);
      expect(courseRepository.save).toHaveBeenCalledWith(mockCourse);
    });

    it('should create a course with valid faculties', async () => {
      const createCourseDto: CreateCourseDto = {
        name: 'Computer Science',
        acronym: 'CS',
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
      expect(facultyRepository.findBy).toHaveBeenCalled();
    });

    it('should throw NotFoundException if any faculty is not found', async () => {
      const createCourseDto: CreateCourseDto = {
        name: 'Computer Science',
        acronym: 'CS',
        facultyIds: [1, 2],
      };
      mockCourseRepository.create.mockReturnValue(mockCourse);
      mockFacultyRepository.findBy.mockResolvedValue([mockFaculty]);

      await expect(service.create(createCourseDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a course successfully', async () => {
      const updateCourseDto: UpdateCourseDto = { name: 'New Name' };
      mockCourseRepository.findOneBy.mockResolvedValue({ ...mockCourse });
      mockCourseRepository.save.mockResolvedValue({
        ...mockCourse,
        name: 'New Name',
      });

      const result = await service.update(1, updateCourseDto);

      expect(result.name).toEqual('New Name');
      expect(courseRepository.merge).toHaveBeenCalled();
      expect(courseRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
    });

    it('should update faculties if provided', async () => {
      const updateCourseDto: UpdateCourseDto = { facultyIds: [1] };
      mockCourseRepository.findOneBy.mockResolvedValue({ ...mockCourse });
      mockFacultyRepository.findBy.mockResolvedValue([mockFaculty]);
      mockCourseRepository.save.mockResolvedValue({
        ...mockCourse,
        faculties: [mockFaculty],
      });

      const result = await service.update(1, updateCourseDto);

      expect(result.faculties).toEqual([mockFaculty]);
    });

    it('should throw NotFoundException if updating with invalid faculty IDs', async () => {
      const updateCourseDto: UpdateCourseDto = { facultyIds: [1, 2] };
      mockCourseRepository.findOneBy.mockResolvedValue({ ...mockCourse });
      mockFacultyRepository.findBy.mockResolvedValue([mockFaculty]);

      await expect(service.update(1, updateCourseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should clear faculties if empty array provided', async () => {
      const updateCourseDto: UpdateCourseDto = { facultyIds: [] };
      mockCourseRepository.findOneBy.mockResolvedValue({
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

  describe('remove', () => {
    it('should remove a course', async () => {
      mockCourseRepository.findOneByOrFail.mockResolvedValue(mockCourse);
      mockCourseRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual(mockCourse);
      expect(courseRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if course not found (findOneByOrFail throws)', async () => {
      mockCourseRepository.findOneByOrFail.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.remove(1)).rejects.toThrow('Not found');
    });
  });
});
