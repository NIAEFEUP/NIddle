import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateEventDto } from "@/events/dto/create-event.dto";
import { UpdateEventDto } from "@/events/dto/update-event.dto";
import { Event } from "@/events/entities/event.entity";
import { EventsService } from "@/events/events.service";
import { CreateServiceDto } from "@/services/dto/create-service.dto";
import { UpdateServiceDto } from "@/services/dto/update-service.dto";
import { Service } from "@/services/entity/service.entity";
import { ServicesService } from "@/services/services.service";
import { RequestType } from "./entities/request.entity";
import { Requestable } from "./interfaces/requestable.interface";

const REQUEST_DTOS: Record<
  RequestType,
  { create: new () => object; update: new () => object }
> = {
  [RequestType.EVENT]: { create: CreateEventDto, update: UpdateEventDto },
  [RequestType.SERVICE]: { create: CreateServiceDto, update: UpdateServiceDto },
};

@Injectable()
export class RequestRegistry {
  private readonly handlers = new Map<RequestType, Requestable>();

  constructor(
    private readonly eventsService: EventsService,
    private readonly servicesService: ServicesService,
  ) {
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

  async findTarget(type: RequestType, id: number): Promise<Event | Service> {
    if (type === RequestType.EVENT) {
      return this.eventsService.findOne(id);
    }

    if (type === RequestType.SERVICE) {
      return this.servicesService.findOne(id);
    }

    throw new InternalServerErrorException(
      `No handler registered for request type: ${type}`,
    );
  }

  validateCreatePayload(type: RequestType, payload: unknown): Promise<any> {
    return this.runValidation(REQUEST_DTOS[type].create, payload);
  }

  validateUpdatePayload(type: RequestType, payload: unknown): Promise<any> {
    return this.runValidation(REQUEST_DTOS[type].update, payload);
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
