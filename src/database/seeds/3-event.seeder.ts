import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Faculty } from '../../faculties/entities/faculty.entity';

export default class EventSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const eventFactory = factoryManager.get(Event);
    const facultyRepo = dataSource.getRepository(Faculty);
    const faculties = await facultyRepo.find();

    const events: Event[] = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 50; i++) {
      const event = await eventFactory.make();
      const eventYear =
        event.startDate instanceof Date
          ? event.startDate.getFullYear()
          : currentYear;
      event.year = eventYear;
      if (faculties.length > 0 && Math.random() < 0.8) {
        const faculty = faculties[Math.floor(Math.random() * faculties.length)];
        event.faculty = faculty;
      }
      events.push(event);
    }
    await dataSource.getRepository(Event).save(events);
  }
}
