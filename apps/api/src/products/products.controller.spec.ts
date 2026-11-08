import { NotFoundException } from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { ActiveAssociationGuard } from "@/common/guards/active-association.guard";
import { AdminOnlyGuard } from "@/common/guards/admin-only.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductFilterDto } from "./dto/product-filter.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

describe("ProductsController", () => {
  let controller: ProductsController;

  const mockProduct: Product = {
    id: "1",
    title: "TimeTable Selector",
    description: "A platform to plan semester timetables",
    isArchived: false,
    createdBy: null as any,
  };

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("guards", () => {
    it("findAll and findOne have no guards (public reference data)", () => {
      expect(
        Reflect.getMetadata(
          GUARDS_METADATA,
          ProductsController.prototype.findAll,
        ),
      ).toBeUndefined();
      expect(
        Reflect.getMetadata(
          GUARDS_METADATA,
          ProductsController.prototype.findOne,
        ),
      ).toBeUndefined();
    });

    it("create, update and remove require JwtAuthGuard + AdminOnlyGuard", () => {
      for (const method of ["create", "update", "remove"] as const) {
        const guards = Reflect.getMetadata(
          GUARDS_METADATA,
          ProductsController.prototype[method],
        );
        expect(guards).toContain(JwtAuthGuard);
        expect(guards).toContain(AdminOnlyGuard);
      }
    });

    it("create also requires ActiveAssociationGuard", () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        ProductsController.prototype.create,
      );
      expect(guards).toContain(ActiveAssociationGuard);
    });
  });

  describe("findAll", () => {
    it("should return a paginated response of products", async () => {
      const response = {
        data: [mockProduct],
        meta: {
          page: 1,
          limit: 10,
          itemCount: 1,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
      const filters: ProductFilterDto = { page: 1, limit: 10 };
      mockProductsService.findAll.mockResolvedValue(response);

      const result = await controller.findAll(filters);

      expect(result).toEqual(response);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe("findOne", () => {
    it("should return a single product", async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne("1");

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException if product not found", async () => {
      mockProductsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne("1")).rejects.toThrow(NotFoundException);
      expect(mockProductsService.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("create", () => {
    it("should create a product for the active association", async () => {
      const createProductDto: CreateProductDto = {
        title: "TimeTable Selector",
        description: "A platform to plan semester timetables",
      };
      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto, {
        activeAssociationId: "1",
      });

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.create).toHaveBeenCalledWith(
        createProductDto,
        "1",
      );
    });
  });

  describe("update", () => {
    const updateProductDto: UpdateProductDto = { title: "New title" };

    it("should update a product", async () => {
      const updatedProduct = { ...mockProduct, ...updateProductDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update("1", updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(mockProductsService.update).toHaveBeenCalledWith(
        "1",
        updateProductDto,
      );
    });

    it("should throw NotFoundException if product not found", async () => {
      mockProductsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update("1", updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProductsService.update).toHaveBeenCalledWith(
        "1",
        updateProductDto,
      );
    });
  });

  describe("remove", () => {
    it("should remove a product", async () => {
      mockProductsService.remove.mockResolvedValue(mockProduct);

      const result = await controller.remove("1");

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.remove).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException if product not found", async () => {
      mockProductsService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove("1")).rejects.toThrow(NotFoundException);
      expect(mockProductsService.remove).toHaveBeenCalledWith("1");
    });
  });
});
