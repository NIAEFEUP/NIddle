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
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AssociationsService } from "./associations.service";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { Association } from "./entities/association.entity";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("associations")
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @ApiOperation({ summary: "Get all associations" })
  @ApiResponse({ status: 200, description: "List of associations returned." })
  @Get()
  findAll(): Promise<Association[]> {
    return this.associationsService.findAll();
  }

  @ApiOperation({ summary: "Get association by UUID" })
  @ApiResponse({ status: 200, description: "Association found." })
  @ApiResponse({ status: 204, description: "Association not found." })
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Association> {
    return this.associationsService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new association" })
  @ApiResponse({ status: 201, description: "Association created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post()
  create(
    @Body(ValidationPipe) createAssociationDto: CreateAssociationDto,
  ): Promise<Association> {
    return this.associationsService.create(createAssociationDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update an association by UUID" })
  @ApiResponse({ status: 200, description: "Association updated." })
  @ApiResponse({ status: 204, description: "Association not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateAssociationDto: UpdateAssociationDto,
  ): Promise<Association> {
    return this.associationsService.update(id, updateAssociationDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete an association by UUID" })
  @ApiResponse({ status: 200, description: "Association deleted." })
  @ApiResponse({ status: 204, description: "Association not found." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<Association> {
    return this.associationsService.remove(id);
  }
}
