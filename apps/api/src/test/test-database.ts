import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function getTestDatabaseOptions(): TypeOrmModuleOptions {
  return {
    type: "postgres",
    host: process.env.TEST_DATABASE_HOST,
    port: Number(process.env.TEST_DATABASE_PORT),
    username: process.env.TEST_DATABASE_USER,
    password: process.env.TEST_DATABASE_PASSWORD,
    database: process.env.TEST_DATABASE_NAME,
    autoLoadEntities: true,
    synchronize: true,
  };
}
