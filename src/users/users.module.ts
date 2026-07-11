import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { User } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Association])],
  providers: [UsersService, ConfigService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
