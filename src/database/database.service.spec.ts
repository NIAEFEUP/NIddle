import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DatabaseService } from "./database.service";

describe("DatabaseService", () => {
  let service: DatabaseService;
  let mockDataSource: Partial<DataSource>;
  let module: TestingModule;

  beforeEach(async () => {
    process.env.DATABASE_MASTER = "test-master";
    process.env.DATABASE_SLAVE = "test-slave";
    process.env.DATABASE_USER = "test-user";
    process.env.DATABASE_PASSWORD = "test-password";
    process.env.DATABASE_NAME = "test-db";

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
    delete process.env.DATABASE_MASTER;
    delete process.env.DATABASE_SLAVE;
    delete process.env.DATABASE_USER;
    delete process.env.DATABASE_PASSWORD;
    delete process.env.DATABASE_NAME;
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
    expect(
      (options as { replication: { master: { database: string } } })
        .replication.master.database,
    ).toBe("test-db");
    expect(options.synchronize).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });

  it("should create a single-host connection when DATABASE_SLAVE is not set", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    delete process.env.DATABASE_SLAVE;

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe("postgres");
    expect(options).not.toHaveProperty("replication");
    expect((options as { host: string }).host).toBe("test-master");
    expect((options as { database: string }).database).toBe("test-db");

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
    expect(
      (options as { replication: { master: { database: string } } })
        .replication.master.database,
    ).toBe("test-db");
    expect(options.synchronize).toBe(false);

    process.env.NODE_ENV = originalEnv;
    process.env.DATABASE_SYNCHRONIZE = originalSynchronize;
  });
});
