import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventsModule } from "@/events/events.module";
import { ServicesModule } from "@/services/services.module";
import { User } from "@/users/entities/user.entity";
import { Request } from "./entities/request.entity";
import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User]),
    EventsModule,
    ServicesModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
