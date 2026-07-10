import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { User } from "@/users/entities/user.entity";

export default class AssociationSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const associationFactory = factoryManager.get(Association);
    const userFactory = factoryManager.get(User);

    const associationRepository = dataSource.getRepository(Association);

    const associations: Association[] = [];
    for (let i = 0; i < 5; i++) {
      const association = await associationFactory.make();

      const user = await userFactory.save();
      association.users = [user];

      associations.push(association);
    }

    await associationRepository.save(associations);
  }
}
