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
import { PaginationDto } from "@/common/dto/pagination.dto";
import { CoursesService } from "./courses.service";
import {
  CreateCourseDecorator,
  DeleteCourseDecorator,
  GetAllCoursesDecorator,
  GetOneCourseDecorator,
  UpdateCourseDecorator,
} from "./decorators/courses.decorators";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { Course } from "./entities/course.entity";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @GetAllCoursesDecorator()
  @Get()
  findAll(@Query() pagination: PaginationDto): Promise<Course[]> {
    return this.coursesService.findAll(pagination);
  }

  @GetOneCourseDecorator()
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @CreateCourseDecorator()
  @Post()
  create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @UpdateCourseDecorator()
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @DeleteCourseDecorator()
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<Course> {
    return this.coursesService.remove(id);
  }
}
