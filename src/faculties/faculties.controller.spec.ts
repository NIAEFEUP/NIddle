import { Test, TestingModule } from '@nestjs/testing';
import { FacultiesController } from './faculties.controller';
import { FacultiesService } from './faculties.service';

describe('FacultiesController', () => {
  let controller: FacultiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultiesController],
      providers: [FacultiesService],
    }).compile();

    controller = module.get<FacultiesController>(FacultiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
