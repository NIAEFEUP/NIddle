import { DataSource } from "typeorm";
import { runSeeders } from "typeorm-extension";
import { handleMain, seed } from "./seed";

interface MockDataSource {
  initialize: jest.Mock<Promise<void>>;
}

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
  it("should initialize data source and run seeders", async () => {
    await seed();

    expect(DataSource).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "postgres",
        database: "niddle_db",
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
