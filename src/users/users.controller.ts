import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateUserDto } from "@/users/dto/create-user.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UpdateUserDto } from "@/users/dto/update-user.dto";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new user" })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post()
  create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update an user by ID" })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete an user by ID" })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number): Promise<User> {
    return this.usersService.remove(id);
  }
}
