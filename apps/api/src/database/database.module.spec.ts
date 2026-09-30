import { Test, TestingModule } from "@nestjs/testing";
import { getTestDatabaseOptions } from "@/test/test-database";
import { DatabaseModule } from "./database.module";
import { DatabaseService } from "./database.service";

describe("DatabaseModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        createTypeOrmOptions: () => getTestDatabaseOptions(),
      })
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should provide DatabaseService", () => {
    const service = module.get<DatabaseService>(DatabaseService);
    expect(service).toBeDefined();
  });
});
