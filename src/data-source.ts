import { DataSource, DataSourceOptions } from 'typeorm';
import { Faculty } from './faculties/faculty.entity';
import { SeederOptions } from 'typeorm-extension';

const options: DataSourceOptions & SeederOptions = {
  type: process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite',
  database: process.env.NODE_ENV === 'production' ? 'db' : 'dev.db',
  host: process.env.NODE_ENV === 'production' ? 'localhost' : undefined,
  port: process.env.NODE_ENV === 'production' ? 5432 : undefined,
  username: process.env.NODE_ENV === 'production' ? 'postgres' : undefined,
  password: process.env.NODE_ENV === 'production' ? 'postgres' : undefined,
  entities: [Faculty],
  synchronize: true,
  factories: ['src/database/factories/*.factory.{.ts,.js}'],
  seeds: ['src/database/seeds/*.seeder.{.ts,.js}'],
};

export const dataSource = new DataSource(options);
