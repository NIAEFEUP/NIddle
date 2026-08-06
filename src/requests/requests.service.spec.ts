import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Event } from "@/events/entities/event.entity";
import { EventsService } from "@/events/events.service";
import {
  Request,
  RequestStatus,
  RequestType,
} from "@/requests/entities/request.entity";
import { Service } from "@/services/entity/service.entity";
import { ServicesService } from "@/services/services.service";
import { User } from "@/users/entities/user.entity";
import { RequestsService } from "./requests.service";

describe("RequestsService", () => {
  let service: RequestsService;

  const relations = {
    requestedBy: true,
    targetAssociation: true,
    targetEvent: true,
    targetService: true,
  };

  const mockAssociation: Association = {
    id: 3,
    name: "Chess Club",
    users: [],
    events: [],
    services: [],
    requests: [],
  };

  const mockOtherAssociation: Association = {
    id: 4,
    name: "Rowing Club",
    users: [],
    events: [],
    services: [],
    requests: [],
  };

  const mockUser: User = {
    id: 9,
    name: "John Doe",
    email: "john.doe@example.com",
    password: "hashed",
    isAdmin: false,
    associations: [mockAssociation],
    requests: [],
  };

  const mockAdmin: User = {
    id: 1,
    name: "Admin",
    email: "admin@example.com",
    password: "hashed",
    isAdmin: true,
    associations: [],
    requests: [],
  };

  const mockRequest: Request = {
    id: "req-1",
    type: RequestType.SERVICE,
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
      facultyId: 1,
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

  const mockServiceRepository = { findOneByOrFail: jest.fn() };
  const mockEventRepository = { findOneByOrFail: jest.fn() };
  const mockAssociationRepository = { findOneByOrFail: jest.fn() };
  const mockServicesService = { create: jest.fn(), update: jest.fn() };
  const mockEventsService = { create: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: mockRequestRepository,
        },
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
        },
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(Association),
          useValue: mockAssociationRepository,
        },
        { provide: ServicesService, useValue: mockServicesService },
        { provide: EventsService, useValue: mockEventsService },
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

  describe("approve", () => {
    it("should approve a pending service creation request", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
      });

      const createdService = { id: 1, name: " Papelaria D. Beatriz" };
      mockServicesService.create.mockResolvedValue(createdService);

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

      expect(mockServicesService.create).toHaveBeenCalledWith(
        mockRequest.payload,
        mockRequest.targetAssociation.id,
      );

      expect(mockServicesService.update).not.toHaveBeenCalled();
      expect(mockEventsService.create).not.toHaveBeenCalled();
      expect(mockEventsService.update).not.toHaveBeenCalled();

      expect(mockRequestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: RequestStatus.APPROVED }),
      );

      expect(result).toEqual(createdService);
    });

    it("should approve a pending event creation request", async () => {
      const eventRequest: Request = {
        ...mockRequest,
        type: RequestType.EVENT,
        payload: { name: "FEUP Week", year: 2025, facultyId: 1 } as any,
      };
      mockRequestRepository.findOneOrFail.mockResolvedValue(eventRequest);

      const createdEvent = { id: 1, name: "FEUP Week" };
      mockEventsService.create.mockResolvedValue(createdEvent);
      mockRequestRepository.save.mockResolvedValue({
        ...eventRequest,
        status: RequestStatus.APPROVED,
      });

      const result = await service.approve("req-1");

      expect(mockEventsService.create).toHaveBeenCalledWith(
        eventRequest.payload,
        eventRequest.targetAssociation.id,
      );
      expect(mockServicesService.create).not.toHaveBeenCalled();
      expect(result).toEqual(createdEvent);
    });

    it("should update the existing service when the request targets one", async () => {
      const mockTargetService = { id: 5, name: "Papelaria Antiga" };
      const editRequest: Request = {
        ...mockRequest,
        targetService: mockTargetService as any,
      };
      mockRequestRepository.findOneOrFail.mockResolvedValue(editRequest);

      const updatedService = { id: 5, name: "Papelaria D. Beatriz" };
      mockServicesService.update.mockResolvedValue(updatedService);
      mockRequestRepository.save.mockResolvedValue({
        ...editRequest,
        status: RequestStatus.APPROVED,
      });

      const result = await service.approve("req-1");

      expect(mockServicesService.update).toHaveBeenCalledWith(
        mockTargetService.id,
        editRequest.payload,
      );
      expect(mockServicesService.create).not.toHaveBeenCalled();
      expect(result).toEqual(updatedService);
    });

    it("should update the existing event when the request targets one", async () => {
      const mockTargetEvent = { id: 7, name: "FEUP Week Antigo" };
      const editRequest: Request = {
        ...mockRequest,
        type: RequestType.EVENT,
        targetEvent: mockTargetEvent as any,
      };
      mockRequestRepository.findOneOrFail.mockResolvedValue(editRequest);

      const updatedEvent = { id: 7, name: "FEUP Week Novo" };
      mockEventsService.update.mockResolvedValue(updatedEvent);
      mockRequestRepository.save.mockResolvedValue({
        ...editRequest,
        status: RequestStatus.APPROVED,
      });

      const result = await service.approve("req-1");

      expect(mockEventsService.update).toHaveBeenCalledWith(
        mockTargetEvent.id,
        editRequest.payload,
      );
      expect(mockEventsService.create).not.toHaveBeenCalled();
      expect(result).toEqual(updatedEvent);
    });

    it("should throw BadRequestException when the request is not pending", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.APPROVED,
      });

      await expect(service.approve("req-1")).rejects.toThrow(
        BadRequestException,
      );
      expect(mockServicesService.create).not.toHaveBeenCalled();
      expect(mockRequestRepository.save).not.toHaveBeenCalled();
    });

    it("should throw InternalServerErrorException for an unrecognized request type", async () => {
      mockRequestRepository.findOneOrFail.mockResolvedValue({
        ...mockRequest,
        type: "Unknown" as any,
      });

      await expect(service.approve("req-1")).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("findAll", () => {
    it("admin without header or filters returns everything", async () => {
      mockRequestRepository.find.mockResolvedValue([mockRequest]);

      const result = await service.findAll(mockAdmin, {});

      expect(result).toEqual([mockRequest]);
      expect(mockRequestRepository.find).toHaveBeenCalledWith({
        relations,
        where: {},
      });
    });

    it("admin with a status filter narrows the where clause", async () => {
      mockRequestRepository.find.mockResolvedValue([mockRequest]);

      await service.findAll(mockAdmin, { status: RequestStatus.PENDING });

      expect(mockRequestRepository.find).toHaveBeenCalledWith({
        relations,
        where: { status: RequestStatus.PENDING },
      });
    });

    it("admin with a header scopes results to that association", async () => {
      mockRequestRepository.find.mockResolvedValue([mockRequest]);

      await service.findAll(mockAdmin, { type: RequestType.EVENT }, "3");

      expect(mockRequestRepository.find).toHaveBeenCalledWith({
        where: {
          targetAssociation: { id: 3 },
          type: RequestType.EVENT,
        },
        relations,
      });
    });

    it("throws BadRequestException when the header is not a valid integer", async () => {
      await expect(
        service.findAll(mockAdmin, {}, "not-a-number"),
      ).rejects.toThrow(BadRequestException);
      expect(mockRequestRepository.find).not.toHaveBeenCalled();
    });

    it("non-admin without a header throws BadRequestException", async () => {
      await expect(service.findAll(mockUser, {})).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRequestRepository.find).not.toHaveBeenCalled();
    });

    it("non-admin with an association they don't belong to throws ForbiddenException", async () => {
      await expect(
        service.findAll(mockUser, {}, String(mockOtherAssociation.id)),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRequestRepository.find).not.toHaveBeenCalled();
    });

    it("non-admin with their own association returns scoped, filtered results", async () => {
      mockRequestRepository.find.mockResolvedValue([mockRequest]);

      const result = await service.findAll(
        mockUser,
        { status: RequestStatus.PENDING, requestedBy: mockUser.id },
        String(mockAssociation.id),
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
