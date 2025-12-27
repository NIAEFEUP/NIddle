import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

ApiTags('associations');
@Controller('associations')
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Post()
  create(@Body() createAssociationDto: CreateAssociationDto) {
    return this.associationsService.create(createAssociationDto);
  }

  // Feature #50: GET /associations?facultyId=1
  @ApiQuery({ name: 'facultyId', required: false, type: Number })
  @Get()
  findAll(@Query('facultyId') facultyId?: string) {
    return this.associationsService.findAll(facultyId ? +facultyId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.associationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssociationDto: UpdateAssociationDto,
  ) {
    return this.associationsService.update(+id, updateAssociationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.associationsService.remove(+id);
  }
}
