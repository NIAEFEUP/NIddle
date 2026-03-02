import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Service } from "@/services/entity/service.entity";

export default class ServiceSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const serviceFactory = factoryManager.get(Service);
    await serviceFactory.saveMany(10);
    const serviceRepository = dataSource.getRepository(Service);
    const services = await serviceRepository.find();
    const facultyRepository = dataSource.getRepository(Faculty);
    const faculties = await facultyRepository.find();
    const courseRepository = dataSource.getRepository(Course);
    const courses = await courseRepository.find();
    for (const service of services) {
      const relType = faker.number.int({ min: 0, max: 1 });
      if (relType === 0) {
        // Course relation
        if (courses.length > 0) {
          service.course =
            courses[faker.number.int({ min: 0, max: courses.length - 1 })];
        }
      } else {
        // Faculty relation
        if (faculties.length > 0) {
          service.faculty =
            faculties[faker.number.int({ min: 0, max: faculties.length - 1 })];
        }
      }
    }
    await serviceRepository.save(services);
  }
}
