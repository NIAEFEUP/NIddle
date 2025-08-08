import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { Faculty } from '../faculties/faculty.entity';

(async () => {
  const options: DataSourceOptions & SeederOptions = {
    type: 'sqlite',
    database: 'dev.db',
    entities: [Faculty],
    synchronize: true,
    dropSchema: true,
    factories: ['src/seeds/factories/**/*{.ts,.js}'],
    seeds: ['src/seeds/seeders/**/*{.ts,.js}'],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  await runSeeders(dataSource);
})().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
