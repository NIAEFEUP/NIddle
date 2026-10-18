import { DataSource } from "typeorm";
import { getDataSourceOptions } from "./data-source";

export const migrate = async () => {
  const options = getDataSourceOptions();
  const dataSource = new DataSource(options);
  await dataSource.initialize();
  try {
    const executedMigrations = await dataSource.runMigrations();
    if (executedMigrations.length > 0) {
      console.log(`Executed ${executedMigrations.length} migration(s):`);
      for (const migration of executedMigrations) {
        console.log(` - ${migration.name}`);
      }
    } else {
      console.log("No pending migrations to run.");
    }
    return executedMigrations;
  } finally {
    await dataSource.destroy();
  }
};

export const handleMain = (
  moduleRef: NodeJS.Module,
  mainModule: NodeJS.Module | undefined = require.main,
) => {
  if (mainModule === moduleRef) {
    migrate().catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
  }
};

handleMain(module);
