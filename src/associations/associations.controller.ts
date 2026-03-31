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
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AssociationsService } from "./associations.service";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { Association } from "./entities/association.entity";

@ApiTags("associations")
@Controller("associations")
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @ApiOperation({ summary: "Get all associations" })
  @ApiResponse({ status: 200, description: "List of associations returned." })
  @ApiQuery({ name: "facultyId", required: false, type: Number })
  @Get()
  findAll(@Query("facultyId") facultyId?: string): Promise<Association[]> {
    return this.associationsService.findAll(facultyId ? +facultyId : undefined);
  }

  @ApiOperation({ summary: "Get association by ID" })
  @ApiResponse({ status: 200, description: "Association found." })
  @ApiResponse({ status: 404, description: "Association not found." })
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Association> {
    return this.associationsService.findOne(id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new association" })
  @ApiResponse({ status: 201, description: "Association created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(ValidationPipe) createAssociationDto: CreateAssociationDto,
  ): Promise<Association> {
    return this.associationsService.create(createAssociationDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update an association by ID" })
  @ApiResponse({ status: 200, description: "Association updated." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Association not found." })
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(ValidationPipe) updateAssociationDto: UpdateAssociationDto,
  ): Promise<Association> {
    return this.associationsService.update(id, updateAssociationDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete an association by ID" })
  @ApiResponse({ status: 200, description: "Association deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Association not found." })
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number): Promise<Association> {
    return this.associationsService.remove(id);
  }
}
