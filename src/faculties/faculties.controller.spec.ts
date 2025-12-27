import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacultiesController } from './faculties.controller';
import { FacultiesService } from './faculties.service';
import { Faculty } from './entities/faculty.entity';
import { Course } from '../courses/entities/course.entity';

describe('FacultiesController', () => {
  let controller: FacultiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultiesController],
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

    controller = module.get<FacultiesController>(FacultiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
