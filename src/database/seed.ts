import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { Course } from '../courses/entities/course.entity';
import { Faculty } from '../faculties/entities/faculty.entity';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';

export const seed = async () => {
  const options: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'niddle',
    password: process.env.DATABASE_PASSWORD || 'niddle',
    database: process.env.DATABASE_NAME || 'niddle_db',
    synchronize: true,
    dropSchema: true,
    entities: [Course, Faculty, User, Event],
    seeds: ['src/database/seeds/*.seeder.{ts,js}'],
    factories: ['src/database/factories/*.factory.{ts,js}'],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  await runSeeders(dataSource);
};

export const handleMain = (
  moduleRef: NodeJS.Module,
  mainModule: NodeJS.Module | undefined = require.main,
) => {
  if (mainModule === moduleRef) {
    seed().catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
  }
};

handleMain(module);
