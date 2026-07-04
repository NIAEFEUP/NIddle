import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { getDatabaseSynchronize } from "./synchronize";
import { requiredEnv } from "./helpers/required-env";

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isTest = process.env.NODE_ENV === "test";
    if (isTest) {
      return {
        type: "sqlite",
        database: ":memory:",
        dropSchema: true,
        autoLoadEntities: true,
        synchronize: true,
      };
    }

    const host = requiredEnv("DATABASE_MASTER");
    const port = parseInt(process.env.DATABASE_PORT || "5432", 10);
    const username = requiredEnv("DATABASE_USER");
    const password = requiredEnv("DATABASE_PASSWORD");
    const database = requiredEnv("DATABASE_NAME");
    const slaveHost = process.env.DATABASE_SLAVE;

    const connection = { host, port, username, password, database };
    
    return {
      type: "postgres",
      ...(
        slaveHost ? 
          {
            replication: {
          master: {
            ...connection,
          },
          slaves: [
            {
              ...connection,
              host: slaveHost,
            }
          ],
        },
      } : 
        connection
      ),
      autoLoadEntities: true,
      synchronize: getDatabaseSynchronize(),
    };
  }
}
