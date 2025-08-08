import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { Faculty } from '../faculties/faculty.entity';

(async () => {
  const options: DataSourceOptions & SeederOptions = {
    type: 'sqlite',
    database: 'dev.db',
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
