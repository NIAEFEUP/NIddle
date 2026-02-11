import { Event } from "@events/entities/event.entity";
import { Faculty } from "@faculties/entities/faculty.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoursesController } from "./courses.controller";
import { CoursesModule } from "./courses.module";
import { CoursesService } from "./courses.service";
import { Course } from "./entities/course.entity";

describe("CoursesModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [Course, Faculty, Event],
          synchronize: true,
        }),
        CoursesModule,
      ],
    }).compile();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should resolve CoursesService", () => {
    const service = module.get<CoursesService>(CoursesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(CoursesService);
  });

  it("should resolve CoursesController", () => {
    const controller = module.get<CoursesController>(CoursesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(CoursesController);
  });
});
