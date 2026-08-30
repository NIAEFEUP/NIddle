import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DatabaseService } from "./database.service";

describe("DatabaseService", () => {
  let service: DatabaseService;
  let mockDataSource: Partial<DataSource>;
  let module: TestingModule;

  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
  const ORIGINAL_DATABASE_PORT = process.env.DATABASE_PORT;

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

    if (ORIGINAL_NODE_ENV === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = ORIGINAL_NODE_ENV;
    }

    if (ORIGINAL_DATABASE_PORT === undefined) {
      delete process.env.DATABASE_PORT;
    } else {
      process.env.DATABASE_PORT = ORIGINAL_DATABASE_PORT;
    }

    await module.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create typeorm options for test", () => {
    process.env.NODE_ENV = "test";

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe("sqlite");
    expect(options.database).toBe(":memory:");
    expect(options.synchronize).toBe(true);
  });

  it("should create typeorm options for development", () => {
    process.env.NODE_ENV = "development";

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe("postgres");
    expect(
      (options as { replication: { master: { database: string } } }).replication
        .master.database,
    ).toBe("test-db");
    expect(options.synchronize).toBe(true);
  });

  it("should create a single-host connection when DATABASE_SLAVE is not set", () => {
    process.env.NODE_ENV = "development";
    delete process.env.DATABASE_SLAVE;

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe("postgres");
    expect(options).not.toHaveProperty("replication");
    expect((options as { host: string }).host).toBe("test-master");
    expect((options as { database: string }).database).toBe("test-db");
  });

  it("should create typeorm options for production with synchronize false", () => {
    process.env.NODE_ENV = "production";

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe("postgres");
    expect(
      (options as { replication: { master: { database: string } } }).replication
        .master.database,
    ).toBe("test-db");
    expect(options.synchronize).toBe(false);
  });

  it("should use custom DATABASE_PORT when provided", () => {
    process.env.NODE_ENV = "development";
    process.env.DATABASE_PORT = "5433";

    const options = service.createTypeOrmOptions();
    expect(
      (options as { replication: { master: { port: number } } }).replication
        .master.port,
    ).toBe(5433);
  });

  it("should default to port 5432 when DATABASE_PORT is not set", () => {
    process.env.NODE_ENV = "development";
    delete process.env.DATABASE_PORT;

    const options = service.createTypeOrmOptions();
    expect(
      (options as { replication: { master: { port: number } } }).replication
        .master.port,
    ).toBe(5432);
  });

  it("should create a single-host connection with custom port when DATABASE_SLAVE is not set", () => {
    process.env.NODE_ENV = "development";
    process.env.DATABASE_PORT = "5433";
    delete process.env.DATABASE_SLAVE;

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe("postgres");
    expect((options as { port: number }).port).toBe(5433);
  });
});
