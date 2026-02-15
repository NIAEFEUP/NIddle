import { DataSource, EntityTarget } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { Service } from "@/services/entity/service.entity";
import ServiceSeeder from "./service.seeder";

describe("ServiceSeeder", () => {
  let seeder: ServiceSeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockFactory = {
    saveMany: jest.fn(),
  };

  const mockGet = jest.fn().mockReturnValue(mockFactory);

  beforeEach(() => {
    seeder = new ServiceSeeder();
    dataSource = {} as DataSource;
    factoryManager = {
      get: (entity: EntityTarget<any>) => mockGet(entity) as object,
    } as unknown as SeederFactoryManager;

    mockGet.mockClear();
    mockFactory.saveMany.mockClear();
  });

  it("should be defined", () => {
    expect(seeder).toBeDefined();
  });

  it("should seed services", async () => {
    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(Service);
    expect(mockFactory.saveMany).toHaveBeenCalledWith(10);
  });
});
