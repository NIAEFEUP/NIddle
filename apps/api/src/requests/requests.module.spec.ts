import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { EventsService } from "@/events/events.service";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { ServicesService } from "@/services/services.service";
import { User } from "@/users/entities/user.entity";
import { Request } from "./entities/request.entity";
import { RequestsController } from "./requests.controller";
import { RequestsModule } from "./requests.module";
import { RequestsService } from "./requests.service";

describe("RequestsModule", () => {
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
            Request,
          ],
          synchronize: true,
        }),
        RequestsModule,
      ],
    }).compile();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should resolve RequestsService", () => {
    const service = module.get<RequestsService>(RequestsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(RequestsService);
  });

  it("should resolve RequestsController", () => {
    const controller = module.get<RequestsController>(RequestsController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(RequestsController);
  });

  it("injects the real EventsService and ServicesService into RequestsService", () => {
    const eventsService = module.get<EventsService>(EventsService);
    const servicesService = module.get<ServicesService>(ServicesService);
    expect(eventsService).toBeInstanceOf(EventsService);
    expect(servicesService).toBeInstanceOf(ServicesService);
  });
});
