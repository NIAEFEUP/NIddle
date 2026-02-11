import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isTest = process.env.NODE_ENV === 'test';
    if (isTest) {
      return {
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        autoLoadEntities: true,
        synchronize: true,
        };
    }

    const isProd = process.env.NODE_ENV === 'production';

    return {
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'niddle',
      password: process.env.DATABASE_PASSWORD || 'niddle',
      database: process.env.DATABASE_NAME || 'niddle_db',
      autoLoadEntities: true,
      synchronize: !isProd,
    };
  }
}
