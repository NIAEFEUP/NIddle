import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty } from './faculty.entity';
import { UpdateResult } from 'typeorm';

@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) { }

  @Post()
  create(@Body(ValidationPipe) createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    return this.facultiesService.create(createFacultyDto);
  }

  @Get()
  findAll(): Promise<Faculty[]> {
    return this.facultiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Faculty | null> {
    return this.facultiesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateFacultyDto: UpdateFacultyDto): Promise<Faculty> {
    return this.facultiesService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facultiesService.remove(id);
  }
}
