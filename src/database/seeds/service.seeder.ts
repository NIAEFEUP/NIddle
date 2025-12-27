import { Service } from "../../services/entity/service.entity";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";


export default class ServiceSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ) {
        const serviceFactory = factoryManager.get(Service);
        await serviceFactory.saveMany(10);
    }
}