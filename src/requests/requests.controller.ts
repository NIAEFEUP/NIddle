import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
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
import { Event } from "@/events/entities/event.entity";
import { EventsService } from "@/events/events.service";
import { Request } from "@/requests/entities/request.entity";
import { Service } from "@/services/entity/service.entity";
import { ServicesService } from "@/services/services.service";
import { User } from "@/users/entities/user.entity";
import { CreateRequestDto } from "./dto/create-request.dto";
import { RejectRequestDto } from "./dto/reject-request.dto";
import { RequestFilterDto } from "./dto/request-filter.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { RequestsService } from "./requests.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @ApiOperation({ summary: "Get all requests" })
  @ApiResponse({ status: 200, description: "List of requests returned." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "x-active-association",
    description:
      "The ID of the association the user is acting on. Required for non-admin users. omitting this returns requests across every association.",
    required: false,
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Headers("x-active-association") activeAssociationId: string | undefined,
    @Req() req: { user: User },
    @Query() filters: RequestFilterDto,
  ): Promise<Request[]> {
    return this.requestsService.findAll(req.user, filters, activeAssociationId);
  }

  @ApiOperation({ summary: "Get request by ID" })
  @ApiResponse({ status: 200, description: "Request found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "x-active-association",
    description: "The ID of the association the user is acting on.",
    required: true,
  })
  @Get(":id")
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async findOne(
    @Param("id") id: string,
    @Req() req: { activeAssociationId: number },
  ): Promise<Request> {
    return this.requestsService.findOne(id, req.activeAssociationId);
  }

  @ApiOperation({
    summary:
      "Create a new event/service request for creating or updating an event/service (for updating an already created event/service provide targetID)",
  })
  @ApiResponse({ status: 201, description: "Request created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "x-active-association",
    description: "The ID of the association the user is acting on.",
    required: true,
  })
  @Post()
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async create(
    @Body(ValidationPipe) createRequestDto: CreateRequestDto,
    @Req() req: { user: User; activeAssociationId: number },
  ): Promise<Request> {
    return this.requestsService.create(
      createRequestDto,
      req.user,
      req.activeAssociationId,
    );
  }

  @ApiOperation({ summary: "Update a pending request." })
  @ApiResponse({ status: 200, description: "Request updated." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "x-active-association",
    description: "The ID of the association the user is acting on.",
    required: true,
  })
  @Patch(":id")
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async update(
    @Param("id") id: string,
    @Body(ValidationPipe) updateRequestDto: UpdateRequestDto,
    @Req() req: { activeAssociationId: number },
  ): Promise<Request> {
    return this.requestsService.update(
      id,
      updateRequestDto,
      req.activeAssociationId,
    );
  }

  @ApiOperation({ summary: "Approve a request" })
  @ApiResponse({ status: 200, description: "Request approved." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiBearerAuth("access-token")
  @Patch(":id/approve")
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  async approve(@Param("id") id: string): Promise<Event | Service> {
    return this.requestsService.approve(id);
  }
  @ApiOperation({ summary: "Reject a request" })
  @ApiResponse({ status: 200, description: "Request rejected." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiBearerAuth("access-token")
  @Patch(":id/reject")
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  async reject(
    @Param("id") id: string,
    @Body(ValidationPipe) rejectRequestDto: RejectRequestDto,
  ): Promise<Request> {
    return this.requestsService.reject(id, rejectRequestDto);
  }

  @ApiOperation({ summary: "Delete a request" })
  @ApiResponse({ status: 200, description: "Request deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "x-active-association",
    description: "The ID of the association the user is acting on.",
    required: true,
  })
  @Delete(":id")
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async remove(
    @Param("id") id: string,
    @Req() req: { activeAssociationId: number },
  ): Promise<Request> {
    return this.requestsService.remove(id, req.activeAssociationId);
  }
}
