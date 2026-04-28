import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DatabaseService } from "./database.service";

describe("DatabaseService", () => {
  let service: DatabaseService;
  let mockDataSource: Partial<DataSource>;
  let module: TestingModule;

  beforeEach(async () => {
    mockDataSource = {
      isInitialized: true,
      options: { type: "sqlite", database: ":memory:" },
    };

    module = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(async () => {
    await module.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create typeorm options for test", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe("sqlite");
    expect(options.database).toBe(":memory:");

    process.env.NODE_ENV = originalEnv;
  });

  it("should create typeorm options for development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe("postgres");
    expect(options.database).toBe("niddle_db");
    expect(options.synchronize).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });

  it("should allow synchronize override in production", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSynchronize = process.env.DATABASE_SYNCHRONIZE;
    process.env.NODE_ENV = "production";
    process.env.DATABASE_SYNCHRONIZE = "true";

    const options = service.createTypeOrmOptions();
    expect(options.synchronize).toBe(true);

    process.env.NODE_ENV = originalEnv;
    process.env.DATABASE_SYNCHRONIZE = originalSynchronize;
  });

  it("should create typeorm options for production", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSynchronize = process.env.DATABASE_SYNCHRONIZE;
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_SYNCHRONIZE;

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe("postgres");
    expect(options.database).toBe("niddle_db");
    expect(options.synchronize).toBe(false);

    process.env.NODE_ENV = originalEnv;
    process.env.DATABASE_SYNCHRONIZE = originalSynchronize;
  });
});
