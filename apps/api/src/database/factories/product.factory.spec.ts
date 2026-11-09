import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { setSeederFactory } from "typeorm-extension";
import { CreateProductDto } from "@/products/dto/create-product.dto";
import { ProductLinkTag } from "@/products/dto/product-link.dto";
import { Product } from "@/products/entities/product.entity";
import productFactory from "./product.factory";

interface MockedFactory {
  entity: unknown;
  factoryFn: () => Product;
}

jest.mock("typeorm-extension", () => ({
  setSeederFactory: jest.fn(
    (entity: unknown, factoryFn: () => unknown): MockedFactory => {
      return { entity, factoryFn: factoryFn as () => Product };
    },
  ),
}));

describe("ProductFactory", () => {
  const factory = productFactory as unknown as MockedFactory;

  it("should define a factory for Product", () => {
    expect(setSeederFactory).toHaveBeenCalledWith(
      Product,
      expect.any(Function),
    );
    expect(factory.entity).toBe(Product);
  });

  it("should generate products the API would accept", async () => {
    for (let i = 0; i < 100; i++) {
      const product = factory.factoryFn();

      expect(product).toBeInstanceOf(Product);
      expect(
        await validate(plainToInstance(CreateProductDto, product)),
      ).toEqual([]);
    }
  });

  it("should generate both social and technology links", () => {
    for (let i = 0; i < 100; i++) {
      const tags = factory.factoryFn().links?.map((link) => link.tag);

      expect(tags).toContain(ProductLinkTag.SOCIAL);
      expect(tags).toContain(ProductLinkTag.TECHNOLOGY);
    }
  });
});
