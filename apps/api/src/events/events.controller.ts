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
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { PaginatedResponseDto } from "@/common/pagination";
import {
  CreateEventDecorator,
  DeleteEventDecorator,
  GetAllEventsDecorator,
  GetOneEventDecorator,
  UpdateEventDecorator,
} from "./decorators/events.decorators";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilterDto } from "./dto/event-filter.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { Event } from "./entities/event.entity";
import { EventsService } from "./events.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @GetAllEventsDecorator()
  @Get()
  findAll(
    @Query() filters: EventFilterDto,
  ): Promise<PaginatedResponseDto<Event>> {
    return this.eventsService.findAll(filters);
  }

  @GetOneEventDecorator()
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @CreateEventDecorator()
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() req: { activeAssociationId: string },
  ): Promise<Event> {
    return this.eventsService.create(createEventDto, req.activeAssociationId);
  }

  @UpdateEventDecorator()
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(id, updateEventDto);
  }

  @DeleteEventDecorator()
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<Event> {
    return this.eventsService.remove(id);
  }
}
