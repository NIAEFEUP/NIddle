import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Faculty } from '../../faculties/faculty.entity';

export default class FacultySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {
    const facultyFactory = factoryManager.get(Faculty);
    await facultyFactory.saveMany(10);
  }
}
