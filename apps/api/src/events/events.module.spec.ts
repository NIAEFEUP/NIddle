import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
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
          entities: [
            Association,
            Course,
            Faculty,
            Event,
            Service,
            Schedule,
            User,
          ],
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
