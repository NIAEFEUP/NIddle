import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "@/events/entities/event.entity";
import { Request, RequestStatus, RequestType } from "@/requests/entities/request.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { Association } from "@/associations/entities/association.entity";

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Association)
    private associationRepository: Repository<Association>
  ) {}

  async create(
    createRequestDto: CreateRequestDto,
    requestedBy: User,
    activeAssociationId: number,
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

    request.targetAssociation = await this.associationRepository.findOneByOrFail(
      { id : activeAssociationId },
    )

    return this.requestRepository.save(request);
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    activeAssociationId: number,
  ) : Promise<Request> {
    const { eventPayload, servicePayload} = updateRequestDto;

    const request = await this.requestRepository.findOneOrFail({
      where: { id },
      relations: { requestedBy : true, targetAssociation : true },
    });

    if (request.targetAssociation.id !== activeAssociationId) {
      throw new ForbiddenException(
        "You are not authorized to update this request.",
      )
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

  async remove(
    id: string,
    activeAssociationId: number
  ) : Promise<Request> {
    const request = await this.requestRepository.findOneOrFail({
      where: { id },
      relations: { targetAssociation: true },
    });

    if(request.targetAssociation.id !== activeAssociationId) {
      throw new ForbiddenException(
        "You are not authorized to delete this request.",
      )
    }

    await this.requestRepository.delete(id);
    return request;    
  }

  async findOne(
    id: string,
    activeAssociationId: number
  ) : Promise<Request> {
    const request = await this.requestRepository.findOneOrFail({
      where: { id },
      relations: { targetAssociation: true },
    });

    if(request.targetAssociation.id !== activeAssociationId) {
      throw new ForbiddenException(
        "You are not authorized to view this request.",
      )
    }

    return request;
  }

  async findAll(
    user: User,
    activeAssociationHeader?: string,
  ) : Promise<Request[]> {
    let activeAssociationId: number | undefined;

    const relations = { requestedBy: true, targetAssociation: true, targetEvent: true, targetService: true };

    if(activeAssociationHeader) {

      activeAssociationId = parseInt(activeAssociationHeader, 10);

      if (Number.isNaN(activeAssociationId)) {
        throw new BadRequestException(
          "Active Association header must be a valid integer.",
        );
      }
    } 

    if (user.isAdmin) {
      if (activeAssociationId) {
        return this.requestRepository.find({
          where: { targetAssociation: { id: activeAssociationId } },
          relations,
        })
      } else {
        return this.requestRepository.find({
          relations,
        });
      }
    }

    else {
      if (!activeAssociationId) {
        throw new BadRequestException(
          "Active Association header is required for non-admin users.",
        );
      } 
      
      const hasAssociation = user.associations?.some(
        (association: { id: number }) => association.id === activeAssociationId,
      );

      if (!hasAssociation) {
        throw new ForbiddenException(
          `User does not have access to association with ID ${activeAssociationId}.`,
        );
      }

      return this.requestRepository.find({
        where: { targetAssociation: { id: activeAssociationId } },
        relations,
      });
    }
  }
}
