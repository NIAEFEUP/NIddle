import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CreateUserDto } from "@/users/dto/create-user.dto";
import { UpdateUserDto } from "@/users/dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "List of users returned." })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by UUID" })
  @ApiResponse({ status: 200, description: "User found." })
  @ApiResponse({ status: 204, description: "User not found." })
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update a user by UUID" })
  @ApiResponse({ status: 200, description: "User updated." })
  @ApiResponse({ status: 204, description: "User not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete a user by UUID" })
  @ApiResponse({ status: 200, description: "User deleted." })
  @ApiResponse({ status: 204, description: "User not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
