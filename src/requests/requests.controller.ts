import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { RequestsService } from "./requests.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Request } from "@/requests/entities/request.entity";
import { User } from "@/users/entities/user.entity";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { ActiveAssociationGuard } from "@/auth/guards/active-association.guard";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async findOne(
    @Param('id') id: string,
    @Req() req: { activeAssociationId: number},
  ) : Promise<Request> {
    return this.requestsService.findOne(id, req.activeAssociationId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async create(
    @Body(ValidationPipe) createRequestDto: CreateRequestDto,
    @Req() req : { user : User, activeAssociationId: number },
  ): Promise<Request> {
    return this.requestsService.create(createRequestDto, req.user, req.activeAssociationId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRequestDto: UpdateRequestDto,
    @Req() req : { activeAssociationId: number },
  ) : Promise<Request> {
    return this.requestsService.update(id, updateRequestDto, req.activeAssociationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ActiveAssociationGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: { activeAssociationId: number },
  ) : Promise<Request> {
    return this.requestsService.remove(id, req.activeAssociationId);
  }
}
