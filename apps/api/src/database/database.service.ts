import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { requiredEnv } from "./helpers/required-env";
import { SentryTypeOrmLogger } from "./sentry-typeorm.logger";
import { getDatabaseSynchronize } from "./synchronize";

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const host = requiredEnv("DATABASE_MASTER");
    const port = parseInt(process.env.DATABASE_PORT || "5432", 10);
    const username = requiredEnv("DATABASE_USER");
    const password = requiredEnv("DATABASE_PASSWORD");
    const database = requiredEnv("DATABASE_NAME");
    const slaveHost = process.env.DATABASE_SLAVE;

    const connection = { host, port, username, password, database };

    return {
      type: "postgres",
      maxQueryExecutionTime: 300,
      logger: new SentryTypeOrmLogger(),
      ...(slaveHost
        ? {
            replication: {
              master: {
                ...connection,
              },
              slaves: [
                {
                  ...connection,
                  host: slaveHost,
                },
              ],
            },
          }
        : connection),
      autoLoadEntities: true,
      synchronize: getDatabaseSynchronize(),
    };
  }
}
