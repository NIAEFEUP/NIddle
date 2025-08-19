import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProd = process.env.NODE_ENV === 'production';

    return isProd
      ? {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'db',
          autoLoadEntities: true,
          synchronize: false,
        }
      : {
          type: 'sqlite',
          database: 'src/database/dev.db',
          autoLoadEntities: true,
          synchronize: true,
        };
  }
}
