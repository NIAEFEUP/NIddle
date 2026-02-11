import { Course } from "@courses/entities/course.entity";
import { Event } from "@events/entities/event.entity";
import { Faculty } from "@faculties/entities/faculty.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventsController } from "./events.controller";
import { EventsModule } from "./events.module";
import { EventsService } from "./events.service";

describe("EventsModule", () => {
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
        EventsModule,
      ],
    }).compile();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should resolve EventsService", () => {
    const service = module.get<EventsService>(EventsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(EventsService);
  });

  it("should resolve EventsController", () => {
    const controller = module.get<EventsController>(EventsController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(EventsController);
  });
});
