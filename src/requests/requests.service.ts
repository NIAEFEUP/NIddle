import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "@/events/entities/event.entity";
import { Request, RequestStatus, RequestType } from "@/requests/entities/request.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(
    createRequestDto: CreateRequestDto,
    requestedBy: User,
  ): Promise<Request> {
    const { targetId, type, eventPayload, servicePayload } = createRequestDto;

    const request = this.requestRepository.create({
      type,
      payload: eventPayload ?? servicePayload,
      requestedBy,
    });

    if (targetId) {
      if (type === RequestType.SERVICE) {
        request.targetService = await this.serviceRepository.findOneByOrFail({
          id: targetId,
        });
      }
      if (type === RequestType.EVENT) {
        request.targetEvent = await this.eventRepository.findOneByOrFail({
          id: targetId,
        });
      }
    }

    return this.requestRepository.save(request);
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    requestedBy: User,
  ) : Promise<Request> {
    const { eventPayload, servicePayload} = updateRequestDto;

    const request = await this.requestRepository.findOneOrFail({
      where: { id },
      relations: { requestedBy : true },
    });

    if (request.requestedBy?.id !== requestedBy.id) {
      throw new ForbiddenException(
        "You are not authorized to update this request.",
      );
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        "Only pending requests can be updated.",
      );
    }

    if (request.type === RequestType.SERVICE && eventPayload) {
      throw new BadRequestException(
        "Cannot update an event payload for a service request.",
      );
    }

    if ( request.type === RequestType.EVENT && servicePayload) {
      throw new BadRequestException(
        "Cannot update a service payload for an event request.",
      );
    }
    
    if (request.type === RequestType.SERVICE) {
        this.requestRepository.merge(request, {
          payload: {...request.payload, ...servicePayload},
        });
      }
      if (request.type === RequestType.EVENT) {
        this.requestRepository.merge(request, {
          payload: {...request.payload, ...eventPayload},
        });
      }

      return this.requestRepository.save(request);
  }
}
