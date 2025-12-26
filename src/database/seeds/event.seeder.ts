import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Event } from '../../events/event.entity';

export default class EventSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const eventFactory = factoryManager.get(Event);
    await eventFactory.saveMany(20);
  }
}
