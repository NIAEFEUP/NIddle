import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import {
  Request,
  RequestAction,
  RequestStatus,
  RequestType,
} from "@/requests/entities/request.entity";
import { User } from "@/users/entities/user.entity";
import { RequestsService } from "./requests.service";
import { RequestRegistry } from "./requests-registry.service";

describe("RequestsService", () => {
  let service: RequestsService;

  const relations = {
    requestedBy: true,
    targetAssociation: true,
    targetEvent: true,
    targetService: true,
  };

  const mockAssociation: Association = {
    id: "3",
    name: "Chess Club",
    users: [],
    events: [],
    services: [],
    requests: [],
  };

  const mockOtherAssociation: Association = {
    id: "4",
    name: "Rowing Club",
    users: [],
    events: [],
    services: [],
    requests: [],
  };

  const mockUser: User = {
    id: "9",
    name: "John Doe",
    email: "john.doe@example.com",
    password: "hashed",
    isAdmin: false,
    associations: [mockAssociation],
    requests: [],
  };

  const mockRequest: Request = {
    id: "req-1",
    type: RequestType.SERVICE,
    action: RequestAction.CREATE,
    status: RequestStatus.PENDING,
    requestedBy: mockUser,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    reviewedAt: null,
    rejectionReason: null,
    payload: {
      name: "Papelaria D. Beatriz",
      email: "PdB@gmail.com",
      location: "B-142",
      schedule: [],
      phoneNumber: "+315 999999999",
      facultyId: "1",
    } as any,
    targetEvent: null,
    targetService: null,
    targetAssociation: mockAssociation,
  };

  const mockRequestRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockAssociationRepository = { findOneByOrFail: jest.fn() };
  const mockServiceHandler = {
    createFromRequest: jest.fn(),
    updateFromRequest: jest.fn(),
    removeFromRequest: jest.fn(),
  };
  const mockEventHandler = {
    createFromRequest: jest.fn(),
    updateFromRequest: jest.fn(),
    removeFromRequest: jest.fn(),
  };
  const mockRequestRegistry = {
    get: jest.fn((type: RequestType) => {
      if (type === RequestType.SERVICE) return mockServiceHandler;
      if (type === RequestType.EVENT) return mockEventHandler;
      throw new InternalServerErrorException(
        `No handler registered for request type: ${type}`,
      );
    }),
    findTarget: jest.fn(),
    attachTarget: jest.fn((request: any, type: RequestType, target: any) => {
      if (type === RequestType.SERVICE) request.targetService = target;
      if (type === RequestType.EVENT) request.targetEvent = target;
    }),
    getTargetId: jest.fn((request: any, type: RequestType) => {
      if (type === RequestType.SERVICE) return request.targetService?.id;
      if (type === RequestType.EVENT) return request.targetEvent?.id;
      return undefined;
    }),
    detachTarget: jest.fn((request: any) => {
      request.targetEvent = null;
      request.targetService = null;
    }),
    validateCreatePayload: jest.fn((_type: RequestType, payload: unknown) =>
      Promise.resolve(payload),
    ),
    validateUpdatePayload: jest.fn((_type: RequestType, payload: unknown) =>
      Promise.resolve(payload),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: mockRequestRepository,
        },
        {
          provide: getRepositoryToken(Association),
          useValue: mockAssociationRepository,
        },
        { provide: RequestRegistry, useValue: mockRequestRegistry },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("creates a Create-action request without a target", async () => {
      const dto = {
        type: RequestType.SERVICE,
        action: RequestAction.CREATE,
        payload: { name: "Papelaria Nova" } as any,
      };
      const created = {
        type: dto.type,
        action: dto.action,
        payload: dto.payload,
        requestedBy: mockUser,
      };
      mockRequestRepository.create.mockReturnValue(created);
      mockAssociationRepository.findOneByOrFail.mockResolvedValue(
        mockAssociation,
      );
      mockRequestRepository.save.mockImplementation(async (r) => r);

      const result = await service.create(dto as any, mockUser, "3");

      expect(mockRequestRegistry.validateCreatePayload).toHaveBeenCalledWith(
        dto.type,
        dto.payload,
      );
      expect(mockRequestRepository.create).toHaveBeenCalledWith({
        type: dto.type,
        action: dto.action,
        payload: dto.payload,
        requestedBy: mockUser,
      });
      expect(mockRequestRegistry.findTarget).not.toHaveBeenCalled();
      expect(mockAssociationRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: "3",
      });
      expect(result.targetAssociation).toEqual(mockAssociation);
      expect(mockRequestRepository.save).toHaveBeenCalledWith(result);
    });

    it("ignores a targetId sent alongside a Create action", async () => {
      const dto = {
        type: RequestType.SERVICE,
        action: RequestAction.CREATE,
        targetId: "5",
        payload: { name: "Papelaria Nova" } as any,
      };
      mockRequestRepository.create.mockReturnValue({});
      mockAssociationRepository.findOneByOrFail.mockResolvedValue(
        mockAssociation,
      );
      mockRequestRepository.save.mockImplementation(async (r) => r);

      const result = await service.create(dto as any, mockUser, "3");

      expect(mockRequestRegistry.findTarget).not.toHaveBeenCalled();
      expect(result.targetService).toBeUndefined();
      expect(result.targetEvent).toBeUndefined();
    });

    it("validates the target exists via the registry for an Update Existing Service request", async () => {
      const dto = {
        type: RequestType.SERVICE,
        action: RequestAction.UPDATE_EXISTING,
        targetId: "5",
        payload: { name: "Papelaria Editada" } as any,
      };
      const mockTargetService = { id: "5", name: "Papelaria Antiga" };
      mockRequestRepository.create.mockReturnValue({});
      mockRequestRegistry.findTarget.mockResolvedValue(mockTargetService);
      mockAssociationRepository.findOneByOrFail.mockResolvedValue(
        mockAssociation,
      );
      mockRequestRepository.save.mockImplementation(async (r) => r);

      const result = await service.create(dto as any, mockUser, "3");

      expect(mockRequestRegistry.findTarget).toHaveBeenCalledWith(
        RequestType.SERVICE,
        "5",
      );
      expect(result.targetService).toEqual(mockTargetService);
    });

    it("validates the target exists via the registry for an Update Existing Event request", async () => {
      const dto = {
        type: RequestType.EVENT,
        action: RequestAction.UPDATE_EXISTING,
        targetId: "7",
        payload: { name: "FEUP Week" } as any,
      };
      const mockTargetEvent = { id: "7", name: "FEUP Week Antigo" };
      mockRequestRepository.create.mockReturnValue({});
      mockRequestRegistry.findTarget.mockResolvedValue(mockTargetEvent);
      mockAssociationRepository.findOneByOrFail.mockResolvedValue(
        mockAssociation,
      );
      mockRequestRepository.save.mockImplementation(async (r) => r);

      const result = await service.create(dto as any, mockUser, "3");

      expect(mockRequestRegistry.findTarget).toHaveBeenCalledWith(
        RequestType.EVENT,
        "7",
      );
      expect(result.targetEvent).toEqual(mockTargetEvent);
    });

    it("validates the target exists via the registry for a Delete Existing request", async () => {
      const dto = {
        type: RequestType.SERVICE,
        action: RequestAction.DELETE_EXISTING,
        targetId: "5",
      };
      const mockTargetService = { id: "5", name: "Papelaria Antiga" };
      mockRequestRepository.create.mockReturnValue({});
      mockRequestRegistry.findTarget.mockResolvedValue(mockTargetService);
      mockAssociationRepository.findOneByOrFail.mockResolvedValue(
        mockAssociation,
      );
      mockRequestRepository.save.mockImplementation(async (r) => r);

      const result = await service.create(dto as any, mockUser, "3");

      expect(mockRequestRegistry.findTarget).toHaveBeenCalledWith(
        RequestType.SERVICE,
        "5",
      );
      expect(result.targetService).toEqual(mockTargetService);
    });

    it("skips payload validation and stores a null payload for a Delete Existing request", async () => {
      const dto = {
        type: RequestType.SERVICE,
        action: RequestAction.DELETE_EXISTING,
        targetId: "5",
      };
      mockRequestRepository.create.mockReturnValue({});
      mockRequestRegistry.findTarget.mockResolvedValue({ id: "5" });
      mockAssociationRepository.findOneByOrFail.mockResolvedValue(
        mockAssociation,
      );
      mockRequestRepository.save.mockImplementation(async (r) => r);

      await service.create(dto as any, mockUser, "3");

      expect(mockRequestRegistry.validateCreatePayload).not.toHaveBeenCalled();
      expect(mockRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ payload: null }),
      );
    });

    it("throws when the payload fails registry validation", async () => {
      const dto = {
        type: RequestType.SERVICE,
        action: RequestAction.CREATE,
        payload: { name: "" } as any,
      };
      mockRequestRegistry.validateCreatePayload.mockRejectedValueOnce(
        new BadRequestException("Invalid payload."),
      );

      await expect(service.create(dto as any, mockUser, "3")).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("merges the payload into a pending Service request", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });
      mockRequestRepository.merge.mockImplementation((r, patch) =>
        Object.assign(r, patch),
      );
      mockRequestRepository.save.mockImplementation(async (r) => r);

      const dto = { payload: { name: "Papelaria Nova" } as any };
      const result = await service.update("req-1", dto, mockAssociation.id);

      expect(mockRequestRegistry.validateUpdatePayload).toHaveBeenCalledWith(
        mockRequest.type,
        dto.payload,
      );
      expect(mockRequestRepository.merge).toHaveBeenCalledWith(
        expect.objectContaining({ id: "req-1" }),
        { payload: { ...mockRequest.payload, ...dto.payload } },
      );
      expect(result.payload).toEqual({
        ...mockRequest.payload,
        ...dto.payload,
      });
    });

    it("merges the payload into a pending Event request", async () => {
      const eventRequest: Request = { ...mockRequest, type: RequestType.EVENT };
      mockRequestRepository.findOneOrFail.mockResolvedValue(eventRequest);
      mockRequestRepository.merge.mockImplementation((r, patch) =>
        Object.assign(r, patch),
      );
      mockRequestRepository.save.mockImplementation(async (r) => r);

      const dto = { payload: { name: "FEUP Week" } as any };
      const result = await service.update("req-1", dto, mockAssociation.id);

      expect(mockRequestRegistry.validateUpdatePayload).toHaveBeenCalledWith(
        eventRequest.type,
        dto.payload,
      );
      expect(result.payload).toEqual({
        ...eventRequest.payload,
        ...dto.payload,
      });
    });

    it("throws ForbiddenException when the request belongs to another association", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });

      await expect(
        service.update("req-1", { payload: {} }, mockOtherAssociation.id),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });

    it("throws BadRequestException when the request is not pending", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.APPROVED,
      });

      await expect(
        service.update("req-1", { payload: {} }, mockAssociation.id),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws BadRequestException when the request is a Delete Existing action", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        action: RequestAction.DELETE_EXISTING,
        payload: null,
      });

      await expect(
        service.update("req-1", { payload: {} }, mockAssociation.id),
      ).rejects.toThrow(BadRequestException);
      expect(mockRequestRegistry.validateUpdatePayload).not.toHaveBeenCalled();
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });

    it("throws when the payload fails registry validation", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });
      mockRequestRegistry.validateUpdatePayload.mockRejectedValueOnce(
        new BadRequestException("Invalid payload."),
      );

      await expect(
        service.update("req-1", { payload: {} }, mockAssociation.id),
      ).rejects.toThrow(BadRequestException);
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("deletes the request when it belongs to the active association", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });
      mockRequestRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove("req-1", mockAssociation.id);

      expect(mockRequestRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "req-1" },
        relations: { targetAssociation: true },
      });
      expect(mockRequestRepository.delete).toHaveBeenCalledWith("req-1");
      expect(result.id).toEqual(mockRequest.id);
    });

    it("throws ForbiddenException when the request belongs to another association", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });

      await expect(
        service.remove("req-1", mockOtherAssociation.id),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRequestRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("returns the request when it belongs to the active association", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });

      const result = await service.findOne("req-1", mockAssociation.id);

      expect(mockRequestRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "req-1" },
        relations: { targetAssociation: true },
      });
      expect(result.id).toEqual(mockRequest.id);
    });

    it("throws ForbiddenException when the request belongs to another association", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });

      await expect(
        service.findOne("req-1", mockOtherAssociation.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("approve", () => {
    it("approves a Create action for a Service", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });

      const createdService = { id: "1", name: " Papelaria D. Beatriz" };
      mockServiceHandler.createFromRequest.mockResolvedValue(createdService);

      mockRequestRepository.save.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.APPROVED,
        reviewedAt: new Date(),
      });

      const result = await service.approve("req-1");

      expect(mockRequestRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "req-1" },
        relations: {
          targetAssociation: true,
          targetEvent: true,
          targetService: true,
        },
      });

      expect(mockServiceHandler.createFromRequest).toHaveBeenCalledWith(
        mockRequest.payload,
        mockRequest.targetAssociation.id,
      );

      expect(mockServiceHandler.updateFromRequest).not.toHaveBeenCalled();
      expect(mockServiceHandler.removeFromRequest).not.toHaveBeenCalled();
      expect(mockEventHandler.createFromRequest).not.toHaveBeenCalled();

      expect(mockRequestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: RequestStatus.APPROVED }),
      );

      expect(result).toEqual(createdService);
    });

    it("approves a Create action for an Event", async () => {
      const eventRequest: Request = {
        ...mockRequest,
        type: RequestType.EVENT,
        payload: { name: "FEUP Week", year: 2025, facultyId: "1" } as any,
      };
      mockRequestRepository.findOneOrFail.mockResolvedValue(eventRequest);

      const createdEvent = { id: "1", name: "FEUP Week" };
      mockEventHandler.createFromRequest.mockResolvedValue(createdEvent);
      mockRequestRepository.save.mockResolvedValue({
        ...eventRequest,
        status: RequestStatus.APPROVED,
      });

      const result = await service.approve("req-1");

      expect(mockEventHandler.createFromRequest).toHaveBeenCalledWith(
        eventRequest.payload,
        eventRequest.targetAssociation.id,
      );
      expect(mockServiceHandler.createFromRequest).not.toHaveBeenCalled();
      expect(result).toEqual(createdEvent);
    });

    it("approves an Update Existing action for a Service", async () => {
      const mockTargetService = { id: "5", name: "Papelaria Antiga" };
      const editRequest: Request = {
        ...mockRequest,
        action: RequestAction.UPDATE_EXISTING,
        targetService: mockTargetService as any,
      };
      mockRequestRepository.findOneOrFail.mockResolvedValue(editRequest);

      const updatedService = { id: "5", name: "Papelaria D. Beatriz" };
      mockServiceHandler.updateFromRequest.mockResolvedValue(updatedService);
      mockRequestRepository.save.mockResolvedValue({
        ...editRequest,
        status: RequestStatus.APPROVED,
      });

      const result = await service.approve("req-1");

      expect(mockServiceHandler.updateFromRequest).toHaveBeenCalledWith(
        "5",
        editRequest.payload,
      );
      expect(mockServiceHandler.createFromRequest).not.toHaveBeenCalled();
      expect(mockServiceHandler.removeFromRequest).not.toHaveBeenCalled();
      expect(result).toEqual(updatedService);
    });

    it("approves an Update Existing action for an Event", async () => {
      const mockTargetEvent = { id: "7", name: "FEUP Week Antigo" };
      const editRequest: Request = {
        ...mockRequest,
        type: RequestType.EVENT,
        action: RequestAction.UPDATE_EXISTING,
        targetEvent: mockTargetEvent as any,
      };
      mockRequestRepository.findOneOrFail.mockResolvedValue(editRequest);

      const updatedEvent = { id: "7", name: "FEUP Week Novo" };
      mockEventHandler.updateFromRequest.mockResolvedValue(updatedEvent);
      mockRequestRepository.save.mockResolvedValue({
        ...editRequest,
        status: RequestStatus.APPROVED,
      });

      const result = await service.approve("req-1");

      expect(mockEventHandler.updateFromRequest).toHaveBeenCalledWith(
        "7",
        editRequest.payload,
      );
      expect(mockEventHandler.createFromRequest).not.toHaveBeenCalled();
      expect(result).toEqual(updatedEvent);
    });

    it("approves a Delete Existing action for a Service", async () => {
      const mockTargetService = { id: "5", name: "Papelaria Antiga" };
      const deleteRequest: Request = {
        ...mockRequest,
        action: RequestAction.DELETE_EXISTING,
        payload: null,
        targetService: mockTargetService as any,
      };
      mockRequestRepository.findOneOrFail.mockResolvedValue(deleteRequest);

      const removedService = { id: "5", name: "Papelaria D. Beatriz" };
      mockServiceHandler.removeFromRequest.mockResolvedValue(removedService);
      mockRequestRepository.save.mockResolvedValue({
        ...deleteRequest,
        status: RequestStatus.APPROVED,
      });

      const result = await service.approve("req-1");

      expect(mockServiceHandler.removeFromRequest).toHaveBeenCalledWith("5");
      expect(mockServiceHandler.createFromRequest).not.toHaveBeenCalled();
      expect(mockServiceHandler.updateFromRequest).not.toHaveBeenCalled();
      expect(result).toEqual(removedService);
    });

    it("approves a Delete Existing action for an Event", async () => {
      const mockTargetEvent = { id: "7", name: "FEUP Week Antigo" };
      const deleteRequest: Request = {
        ...mockRequest,
        type: RequestType.EVENT,
        action: RequestAction.DELETE_EXISTING,
        payload: null,
        targetEvent: mockTargetEvent as any,
      };
      mockRequestRepository.findOneOrFail.mockResolvedValue(deleteRequest);

      const removedEvent = { id: "7", name: "FEUP Week Antigo" };
      mockEventHandler.removeFromRequest.mockResolvedValue(removedEvent);
      mockRequestRepository.save.mockResolvedValue({
        ...deleteRequest,
        status: RequestStatus.APPROVED,
      });

      const result = await service.approve("req-1");

      expect(mockEventHandler.removeFromRequest).toHaveBeenCalledWith("7");
      expect(result).toEqual(removedEvent);
    });

    it("throws InternalServerErrorException when an Update Existing request is missing its target", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        action: RequestAction.UPDATE_EXISTING,
        targetService: null,
        targetEvent: null,
      });

      await expect(service.approve("req-1")).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockServiceHandler.updateFromRequest).not.toHaveBeenCalled();
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });

    it("throws InternalServerErrorException when a Delete Existing request is missing its target", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        action: RequestAction.DELETE_EXISTING,
        payload: null,
        targetService: null,
        targetEvent: null,
      });

      await expect(service.approve("req-1")).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockServiceHandler.removeFromRequest).not.toHaveBeenCalled();
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });

    it("throws InternalServerErrorException when an Update Existing request has a null payload", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        action: RequestAction.UPDATE_EXISTING,
        payload: null,
        targetService: { id: "5" } as any,
      });

      await expect(service.approve("req-1")).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockServiceHandler.updateFromRequest).not.toHaveBeenCalled();
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when the request is not pending", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.APPROVED,
      });

      await expect(service.approve("req-1")).rejects.toThrow(
        BadRequestException,
      );
      expect(mockServiceHandler.createFromRequest).not.toHaveBeenCalled();
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });

    it("throws InternalServerErrorException for an unrecognized request type", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        type: "Unknown" as any,
      });

      await expect(service.approve("req-1")).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("throws InternalServerErrorException for an unrecognized request action", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        action: "Unknown" as any,
      });

      await expect(service.approve("req-1")).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockServiceHandler.createFromRequest).not.toHaveBeenCalled();
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("reject", () => {
    it("rejects a pending request with the given reason", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });
      mockRequestRepository.save.mockImplementation(async (r) => r);

      const dto = { rejectionReason: "Missing required documents." };
      const result = await service.reject("req-1", dto);

      expect(mockRequestRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "req-1" },
      });
      expect(result.status).toEqual(RequestStatus.REJECTED);
      expect(result.rejectionReason).toEqual(dto.rejectionReason);
      expect(mockRequestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: RequestStatus.REJECTED,
          rejectionReason: dto.rejectionReason,
        }),
      );
    });

    it("throws BadRequestException when the reason is only whitespace", async () => {
      await expect(
        service.reject("req-1", { rejectionReason: "   " }),
      ).rejects.toThrow(BadRequestException);
      expect(mockRequestRepository.findOneOrFail).not.toHaveBeenCalled();
    });

    it("throws BadRequestException when the request is not pending", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.APPROVED,
      });

      await expect(
        service.reject("req-1", { rejectionReason: "Not valid." }),
      ).rejects.toThrow(BadRequestException);
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    // Header parsing and association-membership checks now live entirely in
    // ActiveAssociationGuard (see active-association.guard.spec.ts) — by the
    // time this method runs, activeAssociationId is already a valid string
    // or undefined. This describe block only covers query construction.

    it("without an activeAssociationId or filters returns everything", async () => {
      mockRequestRepository.find.mockResolvedValue([mockRequest]);

      const result = await service.findAll({});

      expect(result).toEqual([mockRequest]);
      expect(mockRequestRepository.find).toHaveBeenCalledWith({
        relations,
        where: {},
      });
    });

    it("a status filter narrows the where clause", async () => {
      mockRequestRepository.find.mockResolvedValue([mockRequest]);

      await service.findAll({ status: RequestStatus.PENDING });

      expect(mockRequestRepository.find).toHaveBeenCalledWith({
        relations,
        where: { status: RequestStatus.PENDING },
      });
    });

    it("scopes results to the given activeAssociationId", async () => {
      mockRequestRepository.find.mockResolvedValue([mockRequest]);

      await service.findAll({ type: RequestType.EVENT }, "3");

      expect(mockRequestRepository.find).toHaveBeenCalledWith({
        where: {
          targetAssociation: { id: "3" },
          type: RequestType.EVENT,
        },
        relations,
      });
    });

    it("combines an activeAssociationId with the other filters", async () => {
      mockRequestRepository.find.mockResolvedValue([mockRequest]);

      const result = await service.findAll(
        { status: RequestStatus.PENDING, requestedBy: mockUser.id },
        mockAssociation.id,
      );

      expect(result).toEqual([mockRequest]);
      expect(mockRequestRepository.find).toHaveBeenCalledWith({
        where: {
          targetAssociation: { id: mockAssociation.id },
          status: RequestStatus.PENDING,
          requestedBy: { id: mockUser.id },
        },
        relations,
      });
    });
  });
});
