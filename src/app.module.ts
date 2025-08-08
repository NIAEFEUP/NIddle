import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FacultiesModule } from './faculties/faculties.module';
import { DatabaseModule } from './database/database.module';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      isProd
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
            database: 'dev.db',
            autoLoadEntities: true,
            synchronize: true,
          },
    ),
    FacultiesModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
