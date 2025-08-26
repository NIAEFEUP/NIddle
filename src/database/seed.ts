import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { Faculty } from '../faculties/faculty.entity';

(async () => {
  const options: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'niddle',
    password: process.env.DATABASE_PASSWORD || 'niddle',
    database: process.env.DATABASE_NAME || 'niddle_db',
    synchronize: true,
    dropSchema: true,
    entities: [Faculty],
    seeds: ['src/database/seeds/*.seeder.{ts,js}'],
    factories: ['src/database/factories/*.factory.{ts,js}'],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  await runSeeders(dataSource);
})().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
