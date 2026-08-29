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
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { Course } from "./entities/course.entity";
import { PaginationDto } from "@/common/dto/pagination.dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: "Get all courses" })
  @ApiResponse({ status: 200, description: "List of courses returned." })
  @Get()
  findAll(@Query() pagination: PaginationDto): Promise<Course[]> {
    return this.coursesService.findAll(pagination);
  }

  @ApiOperation({ summary: "Get course by UUID" })
  @ApiResponse({ status: 200, description: "Course found." })
  @ApiResponse({ status: 204, description: "Course not found." })
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new course" })
  @ApiResponse({ status: 201, description: "Course created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post()
  create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update a course by UUID" })
  @ApiResponse({ status: 200, description: "Course updated." })
  @ApiResponse({ status: 204, description: "Course not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete a course by UUID" })
  @ApiResponse({ status: 200, description: "Course deleted." })
  @ApiResponse({ status: 204, description: "Course not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<Course> {
    return this.coursesService.remove(id);
  }
}
