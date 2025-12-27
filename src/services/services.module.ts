import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entity/service.entity';
import { Schedule } from './entity/schedule.entity';
import { TimeInterval } from './entity/timeInterval.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Schedule, TimeInterval])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
