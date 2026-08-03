import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "@/events/entities/event.entity";
import { Request, RequestType } from "@/requests/entities/request.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { CreateRequestDto } from "./dto/create-request.dto";

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
}
