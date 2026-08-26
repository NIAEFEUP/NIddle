import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Type,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateEventDto } from "@/events/dto/create-event.dto";
import { UpdateEventDto } from "@/events/dto/update-event.dto";
import { EventsService } from "@/events/events.service";
import { CreateServiceDto } from "@/services/dto/create-service.dto";
import { UpdateServiceDto } from "@/services/dto/update-service.dto";
import { ServicesService } from "@/services/services.service";
import { Request, RequestType } from "./entities/request.entity";
import { Requestable } from "./interfaces/requestable.interface";

export interface RequestRegistration<
  TEntity = unknown,
  TCreateDto extends object = object,
  TUpdateDto extends object = object,
> {
  handler: Requestable;
  findTarget: (id: number) => Promise<TEntity>;
  targetKey: keyof Request;
  createDto: Type<TCreateDto>;
  updateDto: Type<TUpdateDto>;
}

@Injectable()
export class RequestRegistry {
  private readonly registry = new Map<RequestType, RequestRegistration>();

  constructor(eventsService: EventsService, servicesService: ServicesService) {
    this.register(RequestType.EVENT, {
      handler: eventsService,
      findTarget: (id) => eventsService.findOne(id),
      targetKey: "targetEvent",
      createDto: CreateEventDto,
      updateDto: UpdateEventDto,
    });

    this.register(RequestType.SERVICE, {
      handler: servicesService,
      findTarget: (id) => servicesService.findOne(id),
      targetKey: "targetService",
      createDto: CreateServiceDto,
      updateDto: UpdateServiceDto,
    });
  }

  private register<TEntity, TCreate extends object, TUpdate extends object>(
    type: RequestType,
    config: RequestRegistration<TEntity, TCreate, TUpdate>,
  ): void {
    this.registry.set(type, config as RequestRegistration);
  }

  private getEntry(type: RequestType): RequestRegistration {
    const entry = this.registry.get(type);

    if (!entry) {
      throw new InternalServerErrorException(
        `No handler registered for request type: ${type}`,
      );
    }

    return entry;
  }

  get(type: RequestType): Requestable {
    return this.getEntry(type).handler;
  }

  async findTarget<T = any>(type: RequestType, id: number): Promise<T> {
    return this.getEntry(type).findTarget(id) as Promise<T>;
  }

  attachTarget(request: Request, type: RequestType, target: any): void {
    const entry = this.registry.get(type);

    if (entry) {
      (request as any)[entry.targetKey] = target;
    }
  }

  getTargetId(request: Request, type: RequestType): number | undefined {
    const entry = this.registry.get(type);

    if (!entry) {
      return undefined;
    }

    const target = (request as any)[entry.targetKey];
    return target?.id;
  }

  detachTarget(request: Request): void {
    for (const entry of this.registry.values()) {
      (request as any)[entry.targetKey] = null;
    }
  }

  async validateCreatePayload<T = any>(
    type: RequestType,
    payload: unknown,
  ): Promise<T> {
    const entry = this.getEntry(type);
    return this.runValidation(entry.createDto, payload) as Promise<T>;
  }

  async validateUpdatePayload<T = any>(
    type: RequestType,
    payload: unknown,
  ): Promise<T> {
    const entry = this.getEntry(type);
    return this.runValidation(entry.updateDto, payload) as Promise<T>;
  }

  private async runValidation<T extends object>(
    payloadType: Type<T>,
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
