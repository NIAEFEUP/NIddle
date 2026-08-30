import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Request,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  GetProfileDecorator,
  SignInDecorator,
} from "./decorators/auth.decorators";
import { SignInDto } from "./dto/signin.dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @GetProfileDecorator()
  @Get("profile")
  getProfile(
    @Request() req: { user: { id: string; name: string; email: string } },
  ) {
    return req.user;
  }

  @SignInDecorator()
  @Post("login")
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
