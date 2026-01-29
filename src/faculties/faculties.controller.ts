import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty } from './entities/faculty.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @ApiOperation({ summary: 'Get all faculties' })
  @ApiResponse({ status: 200, description: 'List of faculties returned.' })
  @Get()
  findAll(): Promise<Faculty[]> {
    return this.facultiesService.findAll();
  }

  @ApiOperation({ summary: 'Get faculty by ID' })
  @ApiResponse({ status: 200, description: 'Faculty found.' })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Faculty> {
    return this.facultiesService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new faculty' })
  @ApiResponse({ status: 201, description: 'Faculty created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(ValidationPipe) createFacultyDto: CreateFacultyDto,
  ): Promise<Faculty> {
    return this.facultiesService.create(createFacultyDto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a faculty by ID' })
  @ApiResponse({ status: 200, description: 'Faculty updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    return this.facultiesService.update(id, updateFacultyDto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a faculty by ID' })
  @ApiResponse({ status: 200, description: 'Faculty deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Faculty not found.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<Faculty> {
    return this.facultiesService.remove(id);
  }
}
