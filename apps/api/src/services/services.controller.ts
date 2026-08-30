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
import {
  CreateServiceDecorator,
  DeleteServiceDecorator,
  GetAllServicesDecorator,
  GetOneServiceDecorator,
  UpdateServiceDecorator,
} from "./decorators/services.decorators";
import { CreateServiceDto } from "./dto/create-service.dto";
import { ServiceFilterDto } from "./dto/service-filter.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./entity/service.entity";
import { ServicesService } from "./services.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @GetAllServicesDecorator()
  @Get()
  findAll(@Query() filters: ServiceFilterDto): Promise<Service[]> {
    return this.servicesService.findAll(filters);
  }

  @GetOneServiceDecorator()
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Service> {
    return this.servicesService.findOne(id);
  }

  @CreateServiceDecorator()
  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: { activeAssociationId: string },
  ): Promise<Service> {
    return this.servicesService.create(
      createServiceDto,
      req.activeAssociationId,
    );
  }

  @UpdateServiceDecorator()
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @DeleteServiceDecorator()
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<Service> {
    return this.servicesService.remove(id);
  }
}
