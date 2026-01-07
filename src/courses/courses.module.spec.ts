import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { CoursesModule } from './courses.module';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Faculty } from '../faculties/entities/faculty.entity';
import { Repository } from 'typeorm';

describe('CoursesModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Course, Faculty],
          synchronize: true,
        }),
        CoursesModule,
      ],
    }).compile();
  });

  it('should compile the module', async () => {
    expect(module).toBeDefined();
  });

  it('should resolve CoursesService', async () => {
    const service = module.get<CoursesService>(CoursesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(CoursesService);
  });

  it('should resolve CoursesController', async () => {
    const controller = module.get<CoursesController>(CoursesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(CoursesController);
  });

  it('should have correctly configured Course entity relationships', () => {
    const repository = module.get<Repository<Course>>(getRepositoryToken(Course));
    const metadata = repository.metadata;
    const relation = metadata.findRelationWithPropertyPath('faculties');

    expect(relation).toBeDefined();
    if (relation) {
      expect(relation.inverseSidePropertyPath).toBe('courses');
    }
  });
});
