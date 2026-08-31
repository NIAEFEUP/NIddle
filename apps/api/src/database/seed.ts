import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders, SeederOptions } from "typeorm-extension";
import { getDataSourceOptions } from "./data-source";

export const seed = async () => {
  const options: DataSourceOptions & SeederOptions = {
    ...getDataSourceOptions(),
    synchronize: true,
    dropSchema: true,
    seeds: ["src/database/seeds/*.seeder.{ts,js}"],
    factories: ["src/database/factories/*.factory.{ts,js}"],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();
  await runSeeders(dataSource);
  await dataSource.destroy();
};

export const handleMain = (
  moduleRef: NodeJS.Module,
  mainModule: NodeJS.Module | undefined = require.main,
) => {
  if (mainModule === moduleRef) {
    seed().catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
  }
};

handleMain(module);
