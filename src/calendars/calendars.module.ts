import { Module } from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { CalendarsController } from './calendars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from './calendar.entity';
import { Faculty } from 'src/faculties/faculty.entity';
import { Event } from 'src/events/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calendar, Faculty, Event])],
  controllers: [CalendarsController],
  providers: [CalendarsService],
})
export class CalendarsModule {}
