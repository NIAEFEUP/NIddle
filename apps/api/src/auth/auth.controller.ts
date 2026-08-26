import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/signin.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({
    status: 200,
    description: "User profile returned successfully.",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized: Missing or invalid JWT.",
  })
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(
    @Request() req: { user: { id: string; name: string; email: string } },
  ) {
    return req.user;
  }

  @ApiOperation({ summary: "User login (JWT issuance)" })
  @ApiResponse({ status: 201, description: "Login successful, JWT returned." })
  @ApiResponse({
    status: 401,
    description: "Unauthorized: Invalid credentials.",
  })
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async signIn(@Body(ValidationPipe) signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
