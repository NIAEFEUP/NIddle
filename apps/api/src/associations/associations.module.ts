import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@/users/entities/user.entity";
import { AssociationsController } from "./associations.controller";
import { AssociationsService } from "./associations.service";
import { Association } from "./entities/association.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Association, User])],
  controllers: [AssociationsController],
  providers: [AssociationsService],
  exports: [AssociationsService],
})
export class AssociationsModule {}
