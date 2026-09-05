import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventsService } from "@/events/events.service";
import { ServicesService } from "@/services/services.service";
import { getTestDatabaseOptions } from "@/test/test-database";
import { RequestsController } from "./requests.controller";
import { RequestsModule } from "./requests.module";
import { RequestsService } from "./requests.service";

describe("RequestsModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseOptions()),
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
