import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductFilterDto } from "./dto/product-filter.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { ProductsService } from "./products.service";

describe("ProductsService", () => {
  let service: ProductsService;

  const mockAssociation: Association = {
    id: "1",
    name: "Chess Club",
    users: [],
    events: [],
    services: [],
    requests: [],
    products: [],
  };

  const mockProduct: Product = {
    id: "1",
    title: "TimeTable Selector",
    description: "A platform to plan semester timetables",
    isArchived: false,
    links: [{ label: "GitHub", url: "https://github.com/niaefeup/tts-fe" }],
    technologies: [{ label: "React", url: "https://react.dev" }],
    createdBy: mockAssociation,
  };

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOneOrFail: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockAssociationRepository = {
    findOneByOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Association),
          useValue: mockAssociationRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    mockAssociationRepository.findOneByOrFail.mockResolvedValue(
      mockAssociation,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    beforeEach(() => {
      mockProductRepository.findAndCount.mockResolvedValue([[mockProduct], 1]);
    });

    it("should return a paginated response of products without filters", async () => {
      const filters: ProductFilterDto = { page: 1, limit: 10 };

      const result = await service.findAll(filters);

      expect(result.data).toEqual([mockProduct]);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ["createdBy"],
        skip: 0,
        take: 10,
        order: { id: "ASC" },
      });
    });

    it("should return products filtered by createdById", async () => {
      const filters: ProductFilterDto = {
        createdById: "assoc-1",
        page: 1,
        limit: 10,
      };

      await service.findAll(filters);

      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { createdBy: { id: "assoc-1" } } }),
      );
    });

    it("should return archived products when isArchived is true", async () => {
      const filters: ProductFilterDto = {
        isArchived: true,
        page: 1,
        limit: 10,
      };

      await service.findAll(filters);

      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isArchived: true } }),
      );
    });

    it("should keep the filter when isArchived is false", async () => {
      const filters: ProductFilterDto = {
        isArchived: false,
        page: 1,
        limit: 10,
      };

      await service.findAll(filters);

      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isArchived: false } }),
      );
    });

    it("orders by the requested sortBy field before the id tiebreaker", async () => {
      const filters: ProductFilterDto = {
        sortBy: "title",
        sortOrder: "DESC",
        page: 1,
        limit: 10,
      };

      await service.findAll(filters);

      const { order } = mockProductRepository.findAndCount.mock.calls[0][0];
      expect(order).toEqual({ title: "DESC", id: "ASC" });
      // Key order matters: TypeORM builds ORDER BY in object-key insertion
      // order, so the requested field must come before the id tiebreaker.
      expect(Object.keys(order)).toEqual(["title", "id"]);
    });

    it("defaults sortOrder to ASC when only sortBy is provided", async () => {
      const filters: ProductFilterDto = {
        sortBy: "title",
        page: 1,
        limit: 10,
      };

      await service.findAll(filters);

      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { title: "ASC", id: "ASC" } }),
      );
    });
  });

  describe("findOne", () => {
    it("should return a product by ID and load createdBy", async () => {
      mockProductRepository.findOneOrFail.mockResolvedValue(mockProduct);

      const result = await service.findOne("1");

      expect(result).toEqual(mockProduct);
      // The ownership check in RequestsService relies on createdBy being loaded.
      expect(mockProductRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["createdBy"],
      });
    });

    it("should fail when the product does not exist", async () => {
      mockProductRepository.findOneOrFail.mockRejectedValue(
        new Error("not found"),
      );

      await expect(service.findOne("1")).rejects.toThrow("not found");
    });
  });

  describe("create", () => {
    const createProductDto: CreateProductDto = {
      title: "TimeTable Selector",
      description: "A platform to plan semester timetables",
      links: [{ label: "GitHub", url: "https://github.com/niaefeup/tts-fe" }],
    };

    it("should create a product owned by the active association", async () => {
      mockProductRepository.create.mockReturnValue({ ...createProductDto });
      mockProductRepository.save.mockImplementation(async (p) => p);

      const result = await service.create(createProductDto, "1");

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        createProductDto,
      );
      expect(mockAssociationRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: "1",
      });
      expect(result.createdBy).toEqual(mockAssociation);
      expect(result.links).toEqual(createProductDto.links);
    });

    it("should not save when the association does not exist", async () => {
      mockProductRepository.create.mockReturnValue({ ...createProductDto });
      mockAssociationRepository.findOneByOrFail.mockRejectedValue(
        new Error("not found"),
      );

      await expect(service.create(createProductDto, "1")).rejects.toThrow(
        "not found",
      );
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const updateProductDto: UpdateProductDto = { title: "New title" };

    it("should merge the changes into the product and save it", async () => {
      const existing = { ...mockProduct };
      mockProductRepository.findOneOrFail.mockResolvedValue(existing);
      mockProductRepository.merge.mockImplementation((target, changes) =>
        Object.assign(target, changes),
      );
      mockProductRepository.save.mockImplementation(async (p) => p);

      const result = await service.update("1", updateProductDto);

      expect(mockProductRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["createdBy"],
      });
      expect(mockProductRepository.merge).toHaveBeenCalledWith(
        existing,
        updateProductDto,
      );
      expect(result.title).toEqual("New title");
      expect(result.description).toEqual(mockProduct.description);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it("should not save when the product does not exist", async () => {
      mockProductRepository.findOneOrFail.mockRejectedValue(
        new Error("not found"),
      );

      await expect(service.update("1", updateProductDto)).rejects.toThrow(
        "not found",
      );
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete the product and return it", async () => {
      mockProductRepository.findOneOrFail.mockResolvedValue(mockProduct);
      mockProductRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove("1");

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["createdBy"],
      });
      expect(mockProductRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should not delete when the product does not exist", async () => {
      mockProductRepository.findOneOrFail.mockRejectedValue(
        new Error("not found"),
      );

      await expect(service.remove("1")).rejects.toThrow("not found");
      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("createFromRequest", () => {
    it("delegates to create", async () => {
      const createProductDto: CreateProductDto = {
        title: "TimeTable Selector",
        description: "A platform to plan semester timetables",
      };
      jest.spyOn(service, "create").mockResolvedValue(mockProduct);

      const result = await service.createFromRequest(createProductDto, "1");

      expect(service.create).toHaveBeenCalledWith(createProductDto, "1");
      expect(result).toEqual(mockProduct);
    });
  });

  describe("updateFromRequest", () => {
    it("delegates to update", async () => {
      const updateProductDto: UpdateProductDto = { title: "New title" };
      jest.spyOn(service, "update").mockResolvedValue(mockProduct);

      const result = await service.updateFromRequest("1", updateProductDto);

      expect(service.update).toHaveBeenCalledWith("1", updateProductDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe("removeFromRequest", () => {
    it("delegates to remove", async () => {
      jest.spyOn(service, "remove").mockResolvedValue(mockProduct);

      const result = await service.removeFromRequest("1");

      expect(service.remove).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockProduct);
    });
  });
});
