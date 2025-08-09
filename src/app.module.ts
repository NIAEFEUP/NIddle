import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FacultiesModule } from './faculties/faculties.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, FacultiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
