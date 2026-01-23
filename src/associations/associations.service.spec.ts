import { Test, TestingModule } from '@nestjs/testing';
import { AssociationsService } from './associations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';

describe('AssociationsService', () => {
  let service: AssociationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationsService,
        {
          provide: getRepositoryToken(Association),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AssociationsService>(AssociationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
