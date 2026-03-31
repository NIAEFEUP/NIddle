import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { User } from "@/users/entities/user.entity";

export default class AssociationSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const associationFactory = factoryManager.get(Association);
    const userFactory = factoryManager.get(User);

    const facultyRepository = dataSource.getRepository(Faculty);
    const courseRepository = dataSource.getRepository(Course);
    const associationRepository = dataSource.getRepository(Association);

    const faculties = await facultyRepository.find();
    const courses = await courseRepository.find();

    const associations: Association[] = [];
    for (let i = 0; i < 5; i++) {
      const association = await associationFactory.make();

      // Each association needs a unique user (OneToOne relationship)
      const user = await userFactory.save();
      association.user = user;

      // Assign a random faculty (required)
      if (faculties.length > 0) {
        association.faculty =
          faculties[faker.number.int({ min: 0, max: faculties.length - 1 })];
      }

      // Optionally assign a course (50% chance)
      if (courses.length > 0 && faker.datatype.boolean()) {
        association.course =
          courses[faker.number.int({ min: 0, max: courses.length - 1 })];
      }

      associations.push(association);
    }

    await associationRepository.save(associations);
  }
}
