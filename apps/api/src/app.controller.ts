import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller()
export class AppController {
  @ApiOperation({ summary: "Get API status" })
  @ApiResponse({
    status: 200,
    description: "API status retrieved successfully.",
  })
  @Get()
  root() {
    return {
      status: "online",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      message: "Welcome to the NIddle API!",
    };
  }
}
