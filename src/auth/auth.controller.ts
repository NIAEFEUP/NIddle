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
import { CreateUserDto } from "@users/dto/create-user.dto";
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
    @Request() req: { user: { id: number; name: string; email: string } },
  ) {
    return req.user;
  }

  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User created successfully." })
  @ApiResponse({
    status: 409,
    description: "Conflict: Email is already in use.",
  })
  @Post("register")
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
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
    return await this.authService.signIn(signInDto);
  }
}
