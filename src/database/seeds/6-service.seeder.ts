import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Service } from "@/services/entity/service.entity";

export default class ServiceSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const serviceFactory = factoryManager.get(Service);
    const facultyRepository = dataSource.getRepository(Faculty);
    const faculties = await facultyRepository.find();
    const courseRepository = dataSource.getRepository(Course);
    const courses = await courseRepository.find();
    const associationRepository = dataSource.getRepository(Association);
    const associations = await associationRepository.find();

    const services: Service[] = [];
    for (let i = 0; i < 10; i++) {
      const service = await serviceFactory.make();

      if (associations.length > 0) {
        service.createdBy =
          associations[
            faker.number.int({ min: 0, max: associations.length - 1 })
          ];
      }

      const relType = faker.number.int({ min: 0, max: 1 });
      if (relType === 0) {
        if (courses.length > 0) {
          service.course =
            courses[faker.number.int({ min: 0, max: courses.length - 1 })];
          service.faculty = null;
        }
      } else {
        if (faculties.length > 0) {
          service.faculty =
            faculties[faker.number.int({ min: 0, max: faculties.length - 1 })];
          service.course = null;
        }
      }
      services.push(service);
    }

    const serviceRepository = dataSource.getRepository(Service);
    await serviceRepository.save(services);
  }
}
