import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { QueryFailedError } from "typeorm";

@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const driverError = exception.driverError as {
      code?: string;
      detail?: string;
    };

    if (driverError?.code === "23505") {
      const fieldMatch = driverError.detail?.match(/^Key \(([^)]+)\)=/);
      const field = fieldMatch ? fieldMatch[1] : "value";

      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: `A record with this ${field} already exists`,
        error: "Conflict",
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: "Internal Server Error",
    });
  }
}
