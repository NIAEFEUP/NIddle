import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { User } from "../../users/entities/user.entity";

export default class UserSeeder implements Seeder {
  public async run(
    _dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const userFactory = factoryManager.get(User);
    await userFactory.saveMany(5);
  }
}
