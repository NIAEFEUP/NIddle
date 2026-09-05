import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getTestDatabaseOptions } from "@/test/test-database";
import { FacultiesController } from "./faculties.controller";
import { FacultiesModule } from "./faculties.module";
import { FacultiesService } from "./faculties.service";

describe("FacultiesModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseOptions()),
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
