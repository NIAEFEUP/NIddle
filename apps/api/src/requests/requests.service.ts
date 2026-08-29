import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Event } from "@/events/entities/event.entity";
import {
  Request,
  RequestAction,
  RequestStatus,
} from "@/requests/entities/request.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { CreateRequestDto } from "./dto/create-request.dto";
import { RejectRequestDto } from "./dto/reject-request.dto";
import { RequestFilterDto } from "./dto/request-filter.dto";
import { UpdateRequestDto } from "./dto/update-request.dto";
import { RequestRegistry } from "./requests-registry.service";

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
    private requestRegistry: RequestRegistry,
  ) {}

  async create(
    createRequestDto: CreateRequestDto,
    requestedBy: User,
    activeAssociationId: string,
  ): Promise<Request> {
    const { targetId, type, action, payload: rawPayload } = createRequestDto;

    const payload =
      action === RequestAction.DELETE_EXISTING
        ? null
        : await this.requestRegistry.validateCreatePayload(type, rawPayload);

    const request = this.requestRepository.create({
      type,
      action,
      payload,
      requestedBy,
    });

    if (action !== RequestAction.CREATE && targetId) {
      const target = await this.requestRegistry.findTarget(type, targetId);
      this.requestRegistry.attachTarget(request, type, target);
    }

    request.targetAssociation =
      await this.associationRepository.findOneByOrFail({
        id: activeAssociationId,
      });

    return this.requestRepository.save(request);
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    activeAssociationId: string,
  ): Promise<Request> {
    const { payload: rawPayload } = updateRequestDto;

    const request = await this.requestRepository.findOneOrFail({
      where: { id },
      relations: { requestedBy: true, targetAssociation: true },
    });

    if (request.targetAssociation.id !== activeAssociationId) {
      throw new ForbiddenException(
        "You are not authorized to update this request.",
      );
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException("Only pending requests can be updated.");
    }

    if (request.action === RequestAction.DELETE_EXISTING) {
      throw new BadRequestException(
        "Delete requests have no payload to update.",
      );
    }

    const payload = await this.requestRegistry.validateUpdatePayload(
      request.type,
      rawPayload,
    );

    this.requestRepository.merge(request, {
      payload: { ...request.payload, ...payload },
    });

    return this.requestRepository.save(request);
  }

  async remove(id: string, activeAssociationId: string): Promise<Request> {
    const request = await this.requestRepository.findOneOrFail({
      where: { id },
      relations: { targetAssociation: true },
    });

    if (request.targetAssociation.id !== activeAssociationId) {
      throw new ForbiddenException(
        "You are not authorized to delete this request.",
      );
    }

    await this.requestRepository.delete(id);
    return request;
  }

  async findOne(id: string, activeAssociationId: string): Promise<Request> {
    const request = await this.requestRepository.findOneOrFail({
      where: { id },
      relations: { targetAssociation: true },
    });

    if (request.targetAssociation.id !== activeAssociationId) {
      throw new ForbiddenException(
        "You are not authorized to view this request.",
      );
    }

    return request;
  }

  async findAll(
    filters: RequestFilterDto,
    activeAssociationId?: string,
  ): Promise<Request[]> {
    const relations = {
      requestedBy: true,
      targetAssociation: true,
      targetEvent: true,
      targetService: true,
    };

    const { type, status, requestedBy, limit, page } = filters;

    const whereFilter = {
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(requestedBy !== undefined && { requestedBy: { id: requestedBy } }),
    };

    const [items] =  await this.requestRepository.findAndCount({
      where: {
        ...(activeAssociationId !== undefined && {
          targetAssociation: { id: activeAssociationId },
        }),
        ...whereFilter,
      },
      relations,
      skip: (page - 1) * limit,
      take: limit,
    });

    return items;
  }

  async approve(id: string): Promise<Event | Service> {
    const request = await this.requestRepository.findOneOrFail({
      where: { id },
      relations: {
        targetAssociation: true,
        targetEvent: true,
        targetService: true,
      },
    });

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException("Only pending requests can be approved.");
    }

    const handler = this.requestRegistry.get(request.type);
    const targetId = this.requestRegistry.getTargetId(request, request.type);

    let result: Event | Service;

    switch (request.action) {
      case RequestAction.CREATE:
        result = await handler.createFromRequest(
          request.payload,
          request.targetAssociation.id,
        );
        break;
      case RequestAction.UPDATE_EXISTING:
        if (targetId === undefined) {
          throw new InternalServerErrorException(
            "Update request is missing its target.",
          );
        }
        if (request.payload === null) {
          throw new InternalServerErrorException(
            "Update request is missing its payload.",
          );
        }
        result = await handler.updateFromRequest(targetId, request.payload);
        break;
      case RequestAction.DELETE_EXISTING:
        if (targetId === undefined) {
          throw new InternalServerErrorException(
            "Delete request is missing its target.",
          );
        }
        this.requestRegistry.detachTarget(request);
        await this.requestRepository.save(request);
        result = await handler.removeFromRequest(targetId);
        break;
      default:
        throw new InternalServerErrorException(
          `Unrecognized request action: ${request.action}`,
        );
    }

    request.status = RequestStatus.APPROVED;
    request.reviewedAt = new Date();

    await this.requestRepository.save(request);

    return result;
  }

  async reject(
    id: string,
    rejectRequestDto: RejectRequestDto,
  ): Promise<Request> {
    if (!rejectRequestDto || rejectRequestDto.rejectionReason.trim() === "") {
      throw new BadRequestException("Rejection reason must be provided.");
    }

    const request = await this.requestRepository.findOneOrFail({
      where: { id },
    });

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException("Only pending requests can be rejected.");
    }

    request.status = RequestStatus.REJECTED;
    request.rejectionReason = rejectRequestDto.rejectionReason;
    request.reviewedAt = new Date();

    return this.requestRepository.save(request);
  }
}
