import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { User } from "@/users/entities/user.entity";
import { AssociationsController } from "./associations.controller";
import { AssociationsService } from "./associations.service";
import { Association } from "./entities/association.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Association, Faculty, User, Course])],
  controllers: [AssociationsController],
  providers: [AssociationsService],
  exports: [AssociationsService],
})
export class AssociationsModule {}
