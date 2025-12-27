import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Calendar } from '../../calendars/calendar.entity';
import { Faculty } from '../../faculties/faculty.entity';
import { Event } from '../../events/event.entity';

export default class CalendarSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const facultyRepo = dataSource.getRepository(Faculty);
    const eventRepo = dataSource.getRepository(Event);
    const faculties = await facultyRepo.find();
    const events = await eventRepo.find();

    const calendarFactory = factoryManager.get(Calendar);

    const globalCalendar = await calendarFactory.make();
    globalCalendar.name = 'Global Calendar';
    globalCalendar.description =
      'This calendar contains global events shared by all faculties.';
    globalCalendar.year = 2025;
    globalCalendar.faculties = faculties;
    globalCalendar.events = events.slice(0, 3);
    await dataSource.getRepository(Calendar).save(globalCalendar);

    for (const faculty of faculties) {
      const facultyCalendar = await calendarFactory.make();
      facultyCalendar.faculties = [faculty];
      facultyCalendar.events = events
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      await dataSource.getRepository(Calendar).save(facultyCalendar);
    }
  }
}
