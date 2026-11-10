import { DataSource, EntityTarget } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { Product } from "@/products/entities/product.entity";
import ProductSeeder from "./7-product.seeder";

describe("ProductSeeder", () => {
  let seeder: ProductSeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockAssociations = [
    { id: "1", name: "Chess Club" },
    { id: "2", name: "Debate Society" },
  ];

  const mockFactory = {
    make: jest.fn(),
  };

  const mockProductRepository = {
    save: jest.fn(),
  };

  const mockAssociationRepository = {
    find: jest.fn(),
  };

  const mockGet = jest.fn().mockReturnValue(mockFactory);

  beforeEach(() => {
    jest.clearAllMocks();
    mockFactory.make.mockImplementation(() =>
      Promise.resolve({ title: "TimeTable Selector" }),
    );
    mockAssociationRepository.find.mockResolvedValue(mockAssociations);

    seeder = new ProductSeeder();
    dataSource = {
      getRepository: jest.fn((entity: EntityTarget<unknown>) =>
        entity === Product ? mockProductRepository : mockAssociationRepository,
      ),
    } as unknown as DataSource;
    factoryManager = {
      get: mockGet,
    } as unknown as SeederFactoryManager;
  });

  it("should be defined", () => {
    expect(seeder).toBeDefined();
  });

  it("should seed products", async () => {
    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(Product);
    expect(dataSource.getRepository).toHaveBeenCalledWith(Association);
    expect(mockFactory.make).toHaveBeenCalledTimes(10);
    expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
  });

  it("should assign an existing association to every product", async () => {
    await seeder.run(dataSource, factoryManager);

    const [savedProducts] = mockProductRepository.save.mock.calls[0];

    expect(savedProducts).toHaveLength(10);
    for (const product of savedProducts) {
      expect(mockAssociations).toContain(product.createdBy);
    }
  });

  it("should not seed products if no associations exist", async () => {
    mockAssociationRepository.find.mockResolvedValue([]);

    await seeder.run(dataSource, factoryManager);

    expect(mockFactory.make).not.toHaveBeenCalled();
    expect(mockProductRepository.save).not.toHaveBeenCalled();
  });
});
