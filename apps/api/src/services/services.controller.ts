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
import { CreateServiceDto } from "./dto/create-service.dto";
import { ServiceFilterDto } from "./dto/service-filter.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./entity/service.entity";
import { ServicesService } from "./services.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiOperation({ summary: "Get all services" })
  @ApiResponse({ status: 200, description: "List of services returned." })
  @Get()
  findAll(@Query() filters: ServiceFilterDto): Promise<Service[]> {
    return this.servicesService.findAll(filters);
  }

  @ApiOperation({ summary: "Get service by ID" })
  @ApiResponse({ status: 200, description: "Service found." })
  @ApiResponse({ status: 204, description: "Service not found" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Service> {
    return this.servicesService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiHeader({
    name: "x-active-association",
    description: "The ID of the association the user is acting on",
    required: true,
  })
  @ApiOperation({ summary: "Create a new service" })
  @ApiResponse({ status: 201, description: "Service created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard, ActiveAssociationGuard)
  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: { activeAssociationId: number },
  ): Promise<Service> {
    return this.servicesService.create(
      createServiceDto,
      req.activeAssociationId,
    );
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update a service by ID" })
  @ApiResponse({ status: 200, description: "Service updated." })
  @ApiResponse({ status: 204, description: "Service not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete a service by ID" })
  @ApiResponse({ status: 200, description: "Service deleted." })
  @ApiResponse({ status: 204, description: "Service not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number): Promise<Service> {
    return this.servicesService.remove(id);
  }
}
