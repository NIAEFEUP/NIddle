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
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { Calendar } from './calendar.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('calendars')
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new calendar' })
  @ApiResponse({ status: 201, description: 'Calendar created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(ValidationPipe) createCalendarDto: CreateCalendarDto,
  ): Promise<Calendar> {
    return this.calendarsService.create(createCalendarDto);
  }

  @ApiOperation({ summary: 'Get all calendars' })
  @ApiResponse({ status: 200, description: 'List of calendars returned.' })
  @Get()
  findAll(): Promise<Calendar[]> {
    return this.calendarsService.findAll();
  }

  @ApiOperation({ summary: 'Get calendar by ID' })
  @ApiResponse({ status: 200, description: 'Calendar found.' })
  @ApiResponse({ status: 404, description: 'Calendar not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Calendar> {
    return this.calendarsService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a calendar by ID' })
  @ApiResponse({ status: 200, description: 'Calendar updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Calendar not found.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateCalendarDto: UpdateCalendarDto,
  ): Promise<Calendar> {
    return this.calendarsService.update(id, updateCalendarDto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a calendar by ID' })
  @ApiResponse({ status: 200, description: 'Calendar deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Calendar not found.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<Calendar> {
    return this.calendarsService.remove(id);
  }
}
