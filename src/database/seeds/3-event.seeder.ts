import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Event } from '../../events/event.entity';
import { Faculty } from '../../faculties/faculty.entity';

export default class EventSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const eventFactory = factoryManager.get(Event);
    const facultyRepo = dataSource.getRepository(Faculty);
    const faculties = await facultyRepo.find();

    const events: Event[] = [];
    for (let i = 0; i < 20; i++) {
      const event = await eventFactory.make();
      event.year = Math.random() < 0.5 ? 2025 : 2026;
      if (faculties.length > 0 && Math.random() < 0.8) {
        const faculty = faculties[Math.floor(Math.random() * faculties.length)];
        event.faculty = faculty;
      }
      events.push(event);
    }
    await dataSource.getRepository(Event).save(events);
  }
}
