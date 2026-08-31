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
import {
  CreateFacultyDecorator,
  DeleteFacultyDecorator,
  GetAllFacultiesDecorator,
  GetOneFacultyDecorator,
  UpdateFacultyDecorator,
} from "./decorators/faculties.decorators";
import { CreateFacultyDto } from "./dto/create-faculty.dto";
import { UpdateFacultyDto } from "./dto/update-faculty.dto";
import { Faculty } from "./entities/faculty.entity";
import { FacultiesService } from "./faculties.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("faculties")
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @GetAllFacultiesDecorator()
  @Get()
  findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Faculty>> {
    return this.facultiesService.findAll(pagination);
  }

  @GetOneFacultyDecorator()
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Faculty> {
    return this.facultiesService.findOne(id);
  }

  @CreateFacultyDecorator()
  @Post()
  create(@Body() createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    return this.facultiesService.create(createFacultyDto);
  }

  @UpdateFacultyDecorator()
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    return this.facultiesService.update(id, updateFacultyDto);
  }

  @DeleteFacultyDecorator()
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<Faculty> {
    return this.facultiesService.remove(id);
  }
}
