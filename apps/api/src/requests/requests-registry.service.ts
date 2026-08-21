import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { EventsService } from "@/events/events.service";
import { ServicesService } from "@/services/services.service";
import { RequestType } from "./entities/request.entity";
import { Requestable } from "./interfaces/requestable.interface";

@Injectable()
export class RequestRegistry {
  private readonly handlers = new Map<RequestType, Requestable>();

  constructor(eventsService: EventsService, servicesService: ServicesService) {
    this.handlers.set(RequestType.EVENT, eventsService);
    this.handlers.set(RequestType.SERVICE, servicesService);
  }

  get(type: RequestType): Requestable {
    const handler = this.handlers.get(type);

    if (!handler) {
      throw new InternalServerErrorException(
        `No handler registered for request type: ${type}`,
      );
    }

    return handler;
  }

  validateCreatePayload(type: RequestType, payload: unknown): Promise<any> {
    return this.runValidation(this.get(type).createPayloadType, payload);
  }

  validateUpdatePayload(type: RequestType, payload: unknown): Promise<any> {
    return this.runValidation(this.get(type).updatePayloadType, payload);
  }

  private async runValidation<T extends object>(
    payloadType: new () => T,
    payload: unknown,
  ): Promise<T> {
    const instance = plainToInstance(payloadType, payload);
    const errors = await validate(instance);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return instance;
  }
}
