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
  UseInterceptors,
} from "@nestjs/common";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AssociationsService } from "./associations.service";
import {
  CreateAssociationDecorator,
  DeleteAssociationDecorator,
  GetAllAssociationsDecorator,
  GetOneAssociationDecorator,
  UpdateAssociationDecorator,
} from "./decorators/associations.decorators";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { Association } from "./entities/association.entity";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("associations")
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @GetAllAssociationsDecorator()
  @Get()
  findAll(@Query() pagination: PaginationDto): Promise<Association[]> {
    return this.associationsService.findAll(pagination);
  }

  @GetOneAssociationDecorator()
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Association> {
    return this.associationsService.findOne(id);
  }

  @CreateAssociationDecorator()
  @Post()
  create(
    @Body() createAssociationDto: CreateAssociationDto,
  ): Promise<Association> {
    return this.associationsService.create(createAssociationDto);
  }

  @UpdateAssociationDecorator()
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateAssociationDto: UpdateAssociationDto,
  ): Promise<Association> {
    return this.associationsService.update(id, updateAssociationDto);
  }

  @DeleteAssociationDecorator()
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<Association> {
    return this.associationsService.remove(id);
  }
}
