import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociationsService } from './associations.service';
import { AssociationsController } from './associations.controller';
import { Association } from './entities/association.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Association])],
  controllers: [AssociationsController],
  providers: [AssociationsService],
  exports: [AssociationsService], 
})
export class AssociationsModule {}