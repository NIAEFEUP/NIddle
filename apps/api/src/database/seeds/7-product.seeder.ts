import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { Product } from "@/products/entities/product.entity";

export default class ProductSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const productFactory = factoryManager.get(Product);
    const associations = await dataSource.getRepository(Association).find();

    //every product needs an association.
    if (associations.length === 0) return;

    const products: Product[] = [];
    for (let i = 0; i < 10; i++) {
      const product = await productFactory.make();
      product.createdBy = faker.helpers.arrayElement(associations);
      products.push(product);
    }

    await dataSource.getRepository(Product).save(products);
  }
}
