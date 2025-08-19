import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Faculty } from './faculty.entity';
import { FacultiesService } from './faculties.service';

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
      ],
    }).compile();

    service = module.get<FacultiesService>(FacultiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
