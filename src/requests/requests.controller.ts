import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { RequestsService } from "./requests.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Request } from "@/requests/entities/request.entity";
import { User } from "@/users/entities/user.entity";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { ActiveAssociationGuard } from "@/auth/guards/active-association.guard";
import { Headers } from "@nestjs/common";
import { Event } from "@/events/entities/event.entity";
import { Service } from "@/services/entity/service.entity";
import { ServicesService } from "@/services/services.service";
import { EventsService } from "@/events/events.service";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("requests")
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Headers("x-active-association") activeAssociationId: string | undefined,
    @Req() req: { user: User },
  ) : Promise<Request[]> {
    return this.requestsService.findAll(req.user, activeAssociationId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async findOne(
    @Param('id') id: string,
    @Req() req: { activeAssociationId: number},
  ) : Promise<Request> {
    return this.requestsService.findOne(id, req.activeAssociationId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async create(
    @Body(ValidationPipe) createRequestDto: CreateRequestDto,
    @Req() req : { user : User, activeAssociationId: number },
  ): Promise<Request> {
    return this.requestsService.create(createRequestDto, req.user, req.activeAssociationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRequestDto: UpdateRequestDto,
    @Req() req : { activeAssociationId: number },
  ) : Promise<Request> {
    return this.requestsService.update(id, updateRequestDto, req.activeAssociationId);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  async approve(
    @Param('id') id: string,
  ) : Promise<Event | Service> {
    return this.requestsService.approve(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: { activeAssociationId: number },
  ) : Promise<Request> {
    return this.requestsService.remove(id, req.activeAssociationId);
  }
}
