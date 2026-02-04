import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Faculty } from '../../faculties/entities/faculty.entity';
import { Course } from '../../courses/entities/course.entity';
import { faker } from '@faker-js/faker';

export default class FacultySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const facultyFactory = factoryManager.get(Faculty);
    const faculties = await facultyFactory.saveMany(10);

    const courseRepository = dataSource.getRepository(Course);
    const courses = await courseRepository.find();

    if (courses.length > 0) {
      for (const faculty of faculties) {
        faculty.courses = faker.helpers.arrayElements(courses, {
          min: 1,
          max: 5,
        });
        await dataSource.getRepository(Faculty).save(faculty);
      }
    }
  }
}
