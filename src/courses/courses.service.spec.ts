import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Faculty } from '../faculties/entities/faculty.entity';

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
