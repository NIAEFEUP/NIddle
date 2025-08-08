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
  factories: ['src/seeds/factories/**/*{.ts,.js}'],
  seeds: ['src/seeds/seeders/**/*{.ts,.js}'],
};

export const dataSource = new DataSource(options);
