import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultiesModule } from './faculties.module';
import { FacultiesService } from './faculties.service';
import { FacultiesController } from './faculties.controller';
import { Faculty } from './entities/faculty.entity';
import { Course } from '../courses/entities/course.entity';

describe('FacultiesModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Faculty, Course],
          synchronize: true,
        }),
        FacultiesModule,
      ],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should resolve FacultiesService', () => {
    const service = module.get<FacultiesService>(FacultiesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(FacultiesService);
  });

  it('should resolve FacultiesController', () => {
    const controller = module.get<FacultiesController>(FacultiesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(FacultiesController);
  });
});
