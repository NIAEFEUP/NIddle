import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { FacultiesService } from './faculties.service';
import { Course } from '../courses/entities/course.entity';

describe('FacultiesService', () => {
  let service: FacultiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacultiesService,
        {
          provide: getRepositoryToken(Faculty),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Course),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FacultiesService>(FacultiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
