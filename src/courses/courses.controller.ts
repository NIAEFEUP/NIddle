import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { Course } from "./entities/course.entity";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: "Get all courses" })
  @ApiResponse({ status: 200, description: "List of courses returned." })
  @Get()
  findAll(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  @ApiOperation({ summary: "Get course by ID" })
  @ApiResponse({ status: 200, description: "Course found." })
  @ApiResponse({ status: 404, description: "Course not found." })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new course" })
  @ApiResponse({ status: 201, description: "Course created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(ValidationPipe) createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update a course by ID" })
  @ApiResponse({ status: 200, description: "Course updated." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Course not found." })
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(ValidationPipe) updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete a course by ID" })
  @ApiResponse({ status: 200, description: "Course deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Course not found." })
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number): Promise<Course> {
    return this.coursesService.remove(id);
  }
}
