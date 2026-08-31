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
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@/common/pagination";
import { CreateUserDto } from "@/users/dto/create-user.dto";
import { UpdateUserDto } from "@/users/dto/update-user.dto";
import {
  CreateUserDecorator,
  DeleteUserDecorator,
  GetAllUsersDecorator,
  GetOneUserDecorator,
  UpdateUserDecorator,
} from "./decorators/users.decorators";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GetAllUsersDecorator()
  @Get()
  findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.findAll(pagination);
  }

  @GetOneUserDecorator()
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @CreateUserDecorator()
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @UpdateUserDecorator()
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @DeleteUserDecorator()
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
