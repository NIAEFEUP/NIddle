import { User } from "@users/entities/user.entity";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

export default class UserSeeder implements Seeder {
  public async run(
    _dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const userFactory = factoryManager.get(User);
    await userFactory.saveMany(5);
  }
}
