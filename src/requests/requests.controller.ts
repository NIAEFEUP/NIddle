import { Body, ClassSerializerInterceptor, Controller, Post, Req, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { RequestsService } from "./requests.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Request } from "@/requests/entities/request.entity";
import { User } from "@/users/entities/user.entity";

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
}
