import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Service } from "@/services/entity/service.entity";

export default class ServiceSeeder implements Seeder {
  public async run(
    _dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const serviceFactory = factoryManager.get(Service);
    await serviceFactory.saveMany(10);
  }
}
