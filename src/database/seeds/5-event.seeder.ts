import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";

export default class EventSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const eventFactory = factoryManager.get(Event);
    const facultyRepo = dataSource.getRepository(Faculty);
    const courseRepo = dataSource.getRepository(Course);
    const associationRepo = dataSource.getRepository(Association);

    const faculties = await facultyRepo.find();
    const courses = await courseRepo.find();
    const associations = await associationRepo.find();

    const events: Event[] = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 50; i++) {
      const event = await eventFactory.make();
      const eventYear =
        event.startDate instanceof Date
          ? event.startDate.getFullYear()
          : currentYear;
      event.year = eventYear;

      if (associations.length > 0) {
        event.createdBy =
          associations[Math.floor(Math.random() * associations.length)];
      }

      const assignFaculty =
        faculties.length > 0 && (courses.length === 0 || Math.random() < 0.5);

      if (assignFaculty) {
        event.faculty = faculties[Math.floor(Math.random() * faculties.length)];
        event.courses = [];
      } else if (courses.length > 0) {
        event.courses = [courses[Math.floor(Math.random() * courses.length)]];
        event.faculty = undefined;
      }

      events.push(event);
    }
    await dataSource.getRepository(Event).save(events);
  }
}
