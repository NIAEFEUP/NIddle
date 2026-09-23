import { DataSource, EntityTarget } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { User } from "@/users/entities/user.entity";
import AssociationSeeder from "./2-association.seeder";

describe("AssociationSeeder", () => {
  let seeder: AssociationSeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockAssociationFactory = {
    make: jest
      .fn()
      .mockImplementation(() => Promise.resolve({ id: "1", users: [] })),
  };

  const mockUserFactory = {
    save: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ id: "1", name: "Test User", email: "test@test.com" }),
      ),
  };

  const mockGet = jest.fn((entity: EntityTarget<unknown>) => {
    if (entity === Association) {
      return mockAssociationFactory;
    } else if (entity === User) {
      return mockUserFactory;
    }
    return {};
  });

  beforeEach(() => {
    seeder = new AssociationSeeder();
    mockGet.mockClear();
    mockAssociationFactory.make.mockClear();
    mockUserFactory.save.mockClear();
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(seeder).toBeDefined();
  });

  it("should seed associations", async () => {
    const mockAssociationRepository = {
      save: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<unknown>) => {
      if (entity === Association) {
        return mockAssociationRepository;
      }
    });

    dataSource = {
      getRepository: getRepositoryMock,
    } as unknown as DataSource;

    factoryManager = {
      get: mockGet,
    } as unknown as SeederFactoryManager;

    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(Association);
    expect(mockGet).toHaveBeenCalledWith(User);
    expect(mockAssociationFactory.make).toHaveBeenCalledTimes(5);
    expect(mockUserFactory.save).toHaveBeenCalledTimes(5);
    expect(mockAssociationRepository.save).toHaveBeenCalled();
  });
});
