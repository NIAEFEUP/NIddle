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
import { Event } from "@/events/entities/event.entity";
import { Request } from "@/requests/entities/request.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import {
  ApproveRequestDecorator,
  CreateRequestDecorator,
  DeleteRequestDecorator,
  GetAllRequestsDecorator,
  GetOneRequestDecorator,
  RejectRequestDecorator,
  UpdateRequestDecorator,
} from "./decorators/requests.decorators";
import { CreateRequestDto } from "./dto/create-request.dto";
import { RejectRequestDto } from "./dto/reject-request.dto";
import { RequestFilterDto } from "./dto/request-filter.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { RequestsService } from "./requests.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @GetAllRequestsDecorator()
  @Get()
  async findAll(
    @Req() req: { activeAssociationId?: string },
    @Query() filters: RequestFilterDto,
  ): Promise<Request[]> {
    return this.requestsService.findAll(filters, req.activeAssociationId);
  }

  @GetOneRequestDecorator()
  @Get(":id")
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: { activeAssociationId: string },
  ): Promise<Request> {
    return this.requestsService.findOne(id, req.activeAssociationId);
  }

  @CreateRequestDecorator()
  @Post()
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: { user: User; activeAssociationId: string },
  ): Promise<Request> {
    return this.requestsService.create(
      createRequestDto,
      req.user,
      req.activeAssociationId,
    );
  }

  @UpdateRequestDecorator()
  @Patch(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req: { activeAssociationId: string },
  ): Promise<Request> {
    return this.requestsService.update(
      id,
      updateRequestDto,
      req.activeAssociationId,
    );
  }

  @DeleteRequestDecorator()
  @Delete(":id")
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: { activeAssociationId: string },
  ): Promise<Request> {
    return this.requestsService.remove(id, req.activeAssociationId);
  }

  @ApproveRequestDecorator()
  @Patch(":id/approve")
  async approve(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<Event | Service> {
    return this.requestsService.approve(id);
  }

  @RejectRequestDecorator()
  @Patch(":id/reject")
  async reject(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() rejectRequestDto: RejectRequestDto,
  ): Promise<Request> {
    return this.requestsService.reject(id, rejectRequestDto);
  }
}
