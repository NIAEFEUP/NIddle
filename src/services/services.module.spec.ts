import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Schedule } from "./entity/schedule.entity";
import { Service } from "./entity/service.entity";
import { ServicesController } from "./services.controller";
import { ServicesModule } from "./services.module";
import { ServicesService } from "./services.service";

describe("ServicesModule", () => {
  it("should compile the module", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ServicesModule],
    })
      .overrideProvider(getRepositoryToken(Service))
      .useValue({})
      .overrideProvider(getRepositoryToken(Schedule))
      .useValue({})
      .overrideProvider(getRepositoryToken(Faculty))
      .useValue({})
      .overrideProvider(getRepositoryToken(Course))
      .useValue({})
      .compile();

    expect(module).toBeDefined();
    expect(module.get(ServicesController)).toBeDefined();
    expect(module.get(ServicesService)).toBeDefined();
  });
});
