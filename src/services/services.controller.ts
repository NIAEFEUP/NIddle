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
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ActiveAssociationGuard } from "@/auth/guards/active-association.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CreateServiceDto } from "./dto/create-service.dto";
import { ServiceFilterDto } from "./dto/service-filter.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./entity/service.entity";
import { ServicesService } from "./services.service";

@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get all services" })
  @ApiResponse({ status: 200, description: "List of services returned." })
  @Get()
  findAll(@Query() filters: ServiceFilterDto): Promise<Service[]> {
    return this.servicesService.findAll(filters);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get service by ID" })
  @ApiResponse({ status: 200, description: "Service found." })
  @ApiResponse({ status: 404, description: "Service not found" })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Service> {
    return this.servicesService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new service" })
  @ApiResponse({ status: 201, description: "Service created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  @Post()
  create(
    @Body(ValidationPipe) createServiceDto: CreateServiceDto,
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
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Service not found." })
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(ValidationPipe) updateServiceDto: UpdateServiceDto,
    @Req() req: { activeAssociationId: number },
  ): Promise<Service> {
    return this.servicesService.update(
      id,
      updateServiceDto,
      req.activeAssociationId,
    );
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete a service by ID" })
  @ApiResponse({ status: 200, description: "Service deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Service not found." })
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { activeAssociationId: number },
  ): Promise<Service> {
    return this.servicesService.remove(id, req.activeAssociationId);
  }
}
