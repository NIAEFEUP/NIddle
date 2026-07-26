import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { Faculty } from "./entities/faculty.entity";
import { FacultiesController } from "./faculties.controller";
import { FacultiesModule } from "./faculties.module";
import { FacultiesService } from "./faculties.service";

describe("FacultiesModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [
            Association,
            Faculty,
            Course,
            Event,
            Service,
            Schedule,
            User,
          ],
          synchronize: true,
        }),
        FacultiesModule,
      ],
    }).compile();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should resolve FacultiesService", () => {
    const service = module.get<FacultiesService>(FacultiesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(FacultiesService);
  });

  it("should resolve FacultiesController", () => {
    const controller = module.get<FacultiesController>(FacultiesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(FacultiesController);
  });
});
