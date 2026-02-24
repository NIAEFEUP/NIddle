import { createSchema, handleMain } from "./schema";
import { DataSource } from "typeorm";

jest.mock("typeorm", () => {
  const actual = jest.requireActual("typeorm");
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation((options) => {
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

describe("createSchema", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterEach(() => {
    process.env = OLD_ENV;
    jest.clearAllMocks();
  });

  it("should create schema and log success in development", async () => {
    process.env.NODE_ENV = "development";
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await createSchema();
    expect(DataSource).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      "Database schema created successfully.",
    );
    logSpy.mockRestore();
  });

  it("should log when schema sync is disabled in production", async () => {
    process.env.NODE_ENV = "production";
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await createSchema();
    expect(DataSource).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      "Database connection initialized; schema synchronization is disabled (e.g., NODE_ENV=production).",
    );
    logSpy.mockRestore();
  });

  it("should handle schema creation failure", async () => {
    const originalDataSource = DataSource;
    (DataSource as unknown as jest.Mock).mockImplementationOnce((options) => {
      return Object.assign(new originalDataSource(options), {
        initialize: jest.fn().mockRejectedValue(new Error("fail")),
        destroy: jest.fn().mockResolvedValue(undefined),
      });
    });
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("fail");
    });
    let caughtError: Error | undefined;
    try {
      await createSchema();
    } catch (e) {
      caughtError = e;
    }
    expect(caughtError?.message).toBe("fail");
    expect(errorSpy.mock.calls.length).toBeGreaterThan(0);
    expect(errorSpy.mock.calls[0][0]).toEqual(
      expect.stringContaining("Schema creation failed:"),
    );
    expect(errorSpy.mock.calls[0][1]).toBeInstanceOf(Error);
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  describe("handleMain", () => {
    let processExitSpy: jest.SpyInstance;

    beforeEach(() => {
      processExitSpy = jest
        .spyOn(process, "exit")
        .mockImplementation((() => {}) as unknown as (code?: number) => never);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should run schema creation if module is main", async () => {
      const mockModule = { id: "mock" } as NodeJS.Module;
      handleMain(mockModule, mockModule);

      await new Promise((resolve) => setImmediate(resolve));

      expect(DataSource).toHaveBeenCalled();
    });

    it("should NOT run schema creation if module is NOT main", () => {
      const mockModule = { id: "mock" } as NodeJS.Module;
      const otherModule = { id: "other" } as NodeJS.Module;

      handleMain(mockModule, otherModule);
      expect(DataSource).not.toHaveBeenCalled();
    });

    it("should handle errors and exit process", async () => {
      (DataSource as unknown as jest.Mock).mockImplementationOnce(() => ({
        initialize: jest.fn().mockRejectedValue(new Error("fail")),
        destroy: jest.fn().mockResolvedValue(undefined),
      }));

      const mockModule = { id: "mock" } as NodeJS.Module;
      handleMain(mockModule, mockModule);

      await new Promise((resolve) => setImmediate(resolve));

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
