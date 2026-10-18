import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Request,
  UseInterceptors,
} from "@nestjs/common";
import { User } from "@/users/entities/user.entity";
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
  getProfile(@Request() req: { user: User }) {
    return this.authService.getProfile(req.user);
  }

  @SignInDecorator()
  @Post("login")
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
