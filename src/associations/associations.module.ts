import { Module } from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { AssociationsController } from './associations.controller';

@Module({
  controllers: [AssociationsController],
  providers: [AssociationsService],
})
export class AssociationsModule {}
