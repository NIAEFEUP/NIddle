import { DataSource } from "typeorm";
import { runSeeders } from "typeorm-extension";
import { handleMain, seed } from "./seed";

interface MockDataSource {
  initialize: jest.Mock<Promise<void>>;
}

jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

jest.mock("typeorm", () => {
  const actual = jest.requireActual<typeof import("typeorm")>("typeorm");
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

jest.mock("typeorm-extension", () => ({
  runSeeders: jest.fn().mockResolvedValue(undefined),
}));

describe("Seed Script", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...OLD_ENV,
      DATABASE_MASTER: "test-master",
      DATABASE_USER: "test-user",
      DATABASE_PASSWORD: "test-password",
      DATABASE_NAME: "test-db",
    };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("should initialize data source and run seeders", async () => {
    await seed();

    expect(DataSource).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "postgres",
        database: "test-db",
        entities: expect.any(Array) as unknown as (() => unknown)[],
        seeds: expect.any(Array) as unknown as string[],
        factories: expect.any(Array) as unknown as string[],
      }),
    );

    const mockDataSourceClass = DataSource as unknown as jest.Mock;
    const mockDataSourceInstance = mockDataSourceClass.mock.results[0]
      .value as MockDataSource;

    expect(mockDataSourceInstance.initialize).toHaveBeenCalled();
    expect(runSeeders).toHaveBeenCalledWith(mockDataSourceInstance);
  });

  it("should use custom DATABASE_PORT when provided", async () => {
    process.env.DATABASE_PORT = "5433";
    await seed();

    expect(DataSource).toHaveBeenCalledWith(
      expect.objectContaining({ port: 5433 }),
    );
  });

  it("should default to port 5432 when DATABASE_PORT is not set", async () => {
    delete process.env.DATABASE_PORT;

    await seed();

    expect(DataSource).toHaveBeenCalledWith(
      expect.objectContaining({ port: 5432 }),
    );
  });

  describe("environment loading", () => {
    afterEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });

    it("loads .env.local when NOT running in test mode", async () => {
      process.env.NODE_ENV = "development";
      let dotenvConfig: jest.Mock = jest.fn();

      await jest.isolateModulesAsync(async () => {
        require("./seed");
        dotenvConfig = (require("dotenv") as { config: jest.Mock }).config;
      });

      expect(dotenvConfig).toHaveBeenCalledWith({ path: ".env.local" });
    });

    it("does NOT load .env.local when running in test mode", async () => {
      process.env.NODE_ENV = "test";
      let dotenvConfig: jest.Mock = jest.fn();

      await jest.isolateModulesAsync(async () => {
        require("./seed");
        dotenvConfig = (require("dotenv") as { config: jest.Mock }).config;
      });

      expect(dotenvConfig).not.toHaveBeenCalled();
    });
  });

  describe("handleMain", () => {
    let consoleErrorSpy: jest.SpyInstance;
    let processExitSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      processExitSpy = jest.spyOn(process, "exit").mockImplementation((() => {
        /* do nothing*/
      }) as unknown as (code?: number) => never);
      (runSeeders as jest.Mock).mockClear();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should run seed if module is main", async () => {
      const mockModule = { id: "mock" } as NodeJS.Module;

      handleMain(mockModule, mockModule);

      await new Promise((resolve) => setImmediate(resolve));

      expect(runSeeders).toHaveBeenCalled();
    });

    it("should NOT run seed if module is NOT main", () => {
      const mockModule = { id: "mock" } as NodeJS.Module;
      const otherModule = { id: "other" } as NodeJS.Module;

      handleMain(mockModule, otherModule);
      expect(runSeeders).not.toHaveBeenCalled();
    });

    it("should use require.main by default when mainModule argument is omitted", () => {
      const mockModule = { id: "mock" } as NodeJS.Module;
      expect(() => handleMain(mockModule)).not.toThrow();
    });

    it("should handle errors and exit process", async () => {
      const error = new Error("Seeding boom");
      (runSeeders as jest.Mock).mockRejectedValueOnce(error);

      const mockModule = { id: "mock" } as NodeJS.Module;
      handleMain(mockModule, mockModule);

      await new Promise((resolve) => setImmediate(resolve));

      expect(consoleErrorSpy).toHaveBeenCalledWith("Seeding failed:", error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
