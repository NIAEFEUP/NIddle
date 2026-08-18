import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Event } from "@/events/entities/event.entity";
import { EventsModule } from "@/events/events.module";
import { Service } from "@/services/entity/service.entity";
import { ServicesModule } from "@/services/services.module";
import { User } from "@/users/entities/user.entity";
import { Request } from "./entities/request.entity";
import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User, Service, Event, Association]),
    EventsModule,
    ServicesModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
