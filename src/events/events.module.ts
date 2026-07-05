import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { EventTranslation } from "@/i18n/entities";
import { Event } from "./entities/event.entity";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Faculty, Course, EventTranslation]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
