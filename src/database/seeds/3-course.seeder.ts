import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Course } from "../../courses/entities/course.entity";

export default class CourseSeeder implements Seeder {
  public async run(
    _dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const courseFactory = factoryManager.get(Course);
    await courseFactory.saveMany(20);
  }
}
