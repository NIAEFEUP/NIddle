import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
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
    const faculties = await facultyRepo.find();
    const courses = await courseRepo.find();

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

      if (courses.length > 0 && Math.random() < 0.7) {
        const numCourses = Math.floor(Math.random() * 3) + 1;
        const selectedCourses: Course[] = [];
        for (let j = 0; j < numCourses; j++) {
          const course = courses[Math.floor(Math.random() * courses.length)];
          if (!selectedCourses.includes(course)) {
            selectedCourses.push(course);
          }
        }
        event.courses = selectedCourses;
      }

      events.push(event);
    }
    await dataSource.getRepository(Event).save(events);
  }
}
