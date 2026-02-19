import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Service } from "./entity/service.entity";
import { TimeInterval } from "./entity/timeInterval.entity";
import { ServicesController } from "./services.controller";
import { ServicesService } from "./services.service";

@Module({
  imports: [TypeOrmModule.forFeature([Service, TimeInterval])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
