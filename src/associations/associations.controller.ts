import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
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

@ApiTags("associations")
@Controller("associations")
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new association" })
  @ApiResponse({ status: 201, description: "Association created." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createAssociationDto: CreateAssociationDto) {
    return this.associationsService.create(createAssociationDto);
  }

  @ApiQuery({ name: "facultyId", required: false, type: Number })
  @Get()
  findAll(@Query("facultyId") facultyId?: string) {
    return this.associationsService.findAll(facultyId ? +facultyId : undefined);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.associationsService.findOne(+id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update an association by ID" })
  @ApiResponse({ status: 200, description: "Association updated." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Association not found." })
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateAssociationDto: UpdateAssociationDto,
  ) {
    return this.associationsService.update(+id, updateAssociationDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete an association by ID" })
  @ApiResponse({ status: 200, description: "Association deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Association not found." })
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.associationsService.remove(+id);
  }
}
