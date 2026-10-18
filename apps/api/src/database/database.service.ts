import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { getDataSourceOptions } from "./data-source";

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    if (process.env.NODE_ENV === "test") {
      return {
        type: "sqlite",
        database: ":memory:",
        dropSchema: true,
        autoLoadEntities: true,
        synchronize: true,
      };
    }

    return {
      ...getDataSourceOptions(),
      autoLoadEntities: true,
    };
  }
}
