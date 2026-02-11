import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProd = process.env.NODE_ENV === "production";

    return {
      type: "postgres",
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT || "5432", 10),
      username: process.env.DATABASE_USER || "niddle",
      password: process.env.DATABASE_PASSWORD || "niddle",
      database: process.env.DATABASE_NAME || "niddle_db",
      autoLoadEntities: true,
      synchronize: !isProd,
    };
  }
}
