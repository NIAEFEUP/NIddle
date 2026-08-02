import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { User } from '@/users/entities/user.entity';
import { Request } from './entities/request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '@/events/events.module';
import { ServicesModule } from '@/services/services.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request, User]),
  EventsModule,
  ServicesModule
],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
