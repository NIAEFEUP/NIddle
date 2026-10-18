import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { EntityNotFoundError } from "typeorm";

@Catch(EntityNotFoundError)
export class EntityNotFoundFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const entityMatch = exception.message.match(/entity of type "(\w+)"/);
    const entityName = entityMatch ? entityMatch[1] : "Resource";

    const idMatch = exception.message.match(/"id":\s*(?:"([^"]+)"|(\d+))/);
    const id = idMatch ? idMatch[1] || idMatch[2] : "specified";

    const message = `${entityName} with id ${id} not found`;

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: message,
      error: "Not Found",
    });
  }
}
