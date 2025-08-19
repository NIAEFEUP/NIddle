import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FacultiesModule } from './faculties/faculties.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, FacultiesModule],
  controllers: [AppController],
})
export class AppModule {}
