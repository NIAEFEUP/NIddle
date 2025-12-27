import { Test, TestingModule } from '@nestjs/testing';
import { AssociationsController } from './associations.controller';
import { AssociationsService } from './associations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';

describe('AssociationsController', () => {
  let controller: AssociationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssociationsController],
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

    controller = module.get<AssociationsController>(AssociationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
