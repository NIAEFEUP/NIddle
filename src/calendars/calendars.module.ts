import { Module } from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { CalendarsController } from './calendars.controller';

@Module({
  controllers: [CalendarsController],
  providers: [CalendarsService],
})
export class CalendarsModule {}
