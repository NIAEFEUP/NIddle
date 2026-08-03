import { Body, ClassSerializerInterceptor, Controller, Param, Patch, Post, Req, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { RequestsService } from "./requests.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Request } from "@/requests/entities/request.entity";
import { User } from "@/users/entities/user.entity";
import { UpdateRequestDto } from "./dto/update-request.dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(ValidationPipe) createRequestDto: CreateRequestDto,
    @Req() req : { user : User },
  ): Promise<Request> {
    return this.requestsService.create(createRequestDto, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRequestDto: UpdateRequestDto,
    @Req() req : { user : User},
  ) : Promise<Request> {
    return this.requestsService.update(id, updateRequestDto, req.user);
  }
}
