import { DataSource } from "typeorm";
import { handleMain, migrate } from "./migrate";

interface MockDataSource {
  initialize: jest.Mock<Promise<void>>;
  runMigrations: jest.Mock<Promise<Array<{ name: string }>>>;
  destroy: jest.Mock<Promise<void>>;
}

jest.mock("typeorm", () => {
  const actual = jest.requireActual<typeof import("typeorm")>("typeorm");
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      runMigrations: jest.fn().mockResolvedValue([]),
      destroy: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

describe("Migrate Script", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...OLD_ENV,
      DATABASE_MASTER: "test-master",
      DATABASE_USER: "test-user",
      DATABASE_PASSWORD: "test-password",
      DATABASE_NAME: "test-db",
    };
    delete process.env.DATABASE_SLAVE;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("should initialize data source, run migrations, and destroy data source when no migrations pending", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    await migrate();

    const mockDataSourceClass = DataSource as unknown as jest.Mock;
    const mockDataSourceInstance = mockDataSourceClass.mock.results[
      mockDataSourceClass.mock.results.length - 1
    ].value as MockDataSource;

    expect(mockDataSourceInstance.initialize).toHaveBeenCalled();
    expect(mockDataSourceInstance.runMigrations).toHaveBeenCalled();
    expect(mockDataSourceInstance.destroy).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith("No pending migrations to run.");
    consoleLogSpy.mockRestore();
  });

  it("should log executed migrations when migrations are run", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const mockDataSourceClass = DataSource as unknown as jest.Mock;
    mockDataSourceClass.mockImplementationOnce(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      runMigrations: jest.fn().mockResolvedValue([{ name: "TestMigration1" }]),
      destroy: jest.fn().mockResolvedValue(undefined),
    }));

    await migrate();

    expect(consoleLogSpy).toHaveBeenCalledWith("Executed 1 migration(s):");
    expect(consoleLogSpy).toHaveBeenCalledWith(" - TestMigration1");
    consoleLogSpy.mockRestore();
  });

  it("should destroy data source even if runMigrations fails", async () => {
    const error = new Error("Migration query failed");
    const mockDataSourceClass = DataSource as unknown as jest.Mock;
    mockDataSourceClass.mockImplementationOnce(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      runMigrations: jest.fn().mockRejectedValue(error),
      destroy: jest.fn().mockResolvedValue(undefined),
    }));

    await expect(migrate()).rejects.toThrow("Migration query failed");

    const mockDataSourceInstance = mockDataSourceClass.mock.results[
      mockDataSourceClass.mock.results.length - 1
    ].value as MockDataSource;

    expect(mockDataSourceInstance.destroy).toHaveBeenCalled();
  });

  describe("handleMain", () => {
    let consoleErrorSpy: jest.SpyInstance;
    let processExitSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      processExitSpy = jest.spyOn(process, "exit").mockImplementation((() => {
        /* do nothing */
      }) as unknown as (code?: number) => never);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should run migrate if module is main", async () => {
      const mockModule = { id: "mock" } as NodeJS.Module;

      handleMain(mockModule, mockModule);

      await new Promise((resolve) => setImmediate(resolve));

      const mockDataSourceClass = DataSource as unknown as jest.Mock;
      expect(mockDataSourceClass).toHaveBeenCalled();
    });

    it("should NOT run migrate if module is NOT main", () => {
      const mockDataSourceClass = DataSource as unknown as jest.Mock;
      mockDataSourceClass.mockClear();

      const mockModule = { id: "mock" } as NodeJS.Module;
      const otherModule = { id: "other" } as NodeJS.Module;

      handleMain(mockModule, otherModule);
      expect(mockDataSourceClass).not.toHaveBeenCalled();
    });

    it("should use require.main by default when mainModule argument is omitted", () => {
      const mockModule = { id: "mock" } as NodeJS.Module;
      expect(() => handleMain(mockModule)).not.toThrow();
    });

    it("should handle errors and exit process", async () => {
      const error = new Error("Migration fatal error");
      const mockDataSourceClass = DataSource as unknown as jest.Mock;
      mockDataSourceClass.mockImplementationOnce(() => ({
        initialize: jest.fn().mockRejectedValue(error),
        runMigrations: jest.fn().mockResolvedValue([]),
        destroy: jest.fn().mockResolvedValue(undefined),
      }));

      const mockModule = { id: "mock" } as NodeJS.Module;
      handleMain(mockModule, mockModule);

      await new Promise((resolve) => setImmediate(resolve));

      expect(consoleErrorSpy).toHaveBeenCalledWith("Migration failed:", error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
