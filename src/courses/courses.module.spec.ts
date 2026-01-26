import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from './courses.module';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Faculty } from '../faculties/entities/faculty.entity';
import { Event } from '../events/entities/event.entity';

describe('CoursesModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Course, Faculty, Event],
          synchronize: true,
        }),
        CoursesModule,
      ],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should resolve CoursesService', () => {
    const service = module.get<CoursesService>(CoursesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(CoursesService);
  });

  it('should resolve CoursesController', () => {
    const controller = module.get<CoursesController>(CoursesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(CoursesController);
  });
});
