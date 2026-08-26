import {
  Body,
  ClassSerializerInterceptor,
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
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { ActiveAssociationGuard } from "@/auth/guards/active-association.guard";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilterDto } from "./dto/event-filter.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { Event } from "./entities/event.entity";
import { EventsService } from "./events.service";

@UseInterceptors(ClassSerializerInterceptor)
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
  @ApiResponse({ status: 204, description: "Event not found." })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "x-active-association",
    description: "The ID of the association the user is acting on",
    required: true,
  })
  @ApiOperation({ summary: "Create a new event" })
  @ApiResponse({ status: 201, description: "Event created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard, ActiveAssociationGuard)
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() req: { activeAssociationId: number },
  ): Promise<Event> {
    return this.eventsService.create(createEventDto, req.activeAssociationId);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update an event by ID" })
  @ApiResponse({ status: 200, description: "Event updated." })
  @ApiResponse({ status: 204, description: "Event not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(id, updateEventDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete an event by ID" })
  @ApiResponse({ status: 200, description: "Event deleted." })
  @ApiResponse({ status: 204, description: "Event not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number): Promise<Event> {
    return this.eventsService.remove(id);
  }
}
