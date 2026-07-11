import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ActiveAssociationGuard } from "@/auth/guards/active-association.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilterDto } from "./dto/event-filter.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { Event } from "./entities/event.entity";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: "Get all events" })
  @ApiResponse({ status: 200, description: "List of events returned." })
  @Get()
  findAll(@Query() filters: EventFilterDto): Promise<Event[]> {
    return this.eventsService.findAll(filters);
  }

  @ApiOperation({ summary: "Get event by ID" })
  @ApiResponse({ status: 200, description: "Event found." })
  @ApiResponse({ status: 404, description: "Event not found." })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new event" })
  @ApiResponse({ status: 201, description: "Event created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  @Post()
  create(
    @Body(ValidationPipe) createEventDto: CreateEventDto,
    @Req() req: { activeAssociationId: number },
  ): Promise<Event> {
    return this.eventsService.create(createEventDto, req.activeAssociationId);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update an event by ID" })
  @ApiResponse({ status: 200, description: "Event updated." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Event not found." })
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(ValidationPipe) updateEventDto: UpdateEventDto,
    @Req() req: { activeAssociationId: number },
  ): Promise<Event> {
    return this.eventsService.update(
      id,
      updateEventDto,
      req.activeAssociationId,
    );
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete an event by ID" })
  @ApiResponse({ status: 200, description: "Event deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Event not found." })
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { activeAssociationId: number },
  ): Promise<Event> {
    return this.eventsService.remove(id, req.activeAssociationId);
  }
}
