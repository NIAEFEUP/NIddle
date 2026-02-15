import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./entity/service.entity";
import { ServicesService } from "./services.service";

@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiOperation({ summary: "Get all services" })
  @ApiResponse({ status: 200, description: "List of services returned." })
  @Get()
  findAll(): Promise<Service[]> {
    return this.servicesService.findAll();
  }
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
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(ValidationPipe) createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    return this.servicesService.create(createServiceDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update a service by ID" })
  @ApiResponse({ status: 200, description: "Service updated." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Service not found." })
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(ValidationPipe) updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete a service by ID" })
  @ApiResponse({ status: 200, description: "Service deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Service not found." })
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number): Promise<Service> {
    return this.servicesService.remove(id);
  }
}
