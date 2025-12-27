import { Test, TestingModule } from '@nestjs/testing';
import { AssociationsService } from './associations.service';

describe('AssociationsService', () => {
  let service: AssociationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssociationsService],
    }).compile();

    service = module.get<AssociationsService>(AssociationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
