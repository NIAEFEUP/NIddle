import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test, TestingModule } from "@nestjs/testing";
import { ActiveAssociationGuard } from "@/auth/guards/active-association.guard";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RequestStatus, RequestType } from "@/requests/entities/request.entity";
import { User } from "@/users/entities/user.entity";
import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";

describe("RequestsController", () => {
  let controller: RequestsController;

  const mockUser: User = {
    id: 9,
    name: "John Doe",
    email: "john.doe@example.com",
    password: "hashed",
    isAdmin: false,
    associations: [],
    requests: [],
  };

  const mockRequest = {
    id: "req-1",
    type: RequestType.SERVICE,
    status: RequestStatus.PENDING,
    requestedBy: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
    reviewedAt: null,
    rejectionReason: null,
    payload: { name: "Papelaria D. Beatriz" } as any,
    targetEvent: null,
    targetService: null,
    targetAssociation: { id: 3, name: "Chess Club" } as any,
  };

  const mockRequestsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: mockRequestsService,
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("guards", () => {
    it("findAll only requires JwtAuthGuard (association scoping is optional for admins)", () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        RequestsController.prototype.findAll,
      );
      expect(guards).toEqual([JwtAuthGuard]);
    });

    it("findOne, create, update and remove require JwtAuthGuard + ActiveAssociationGuard", () => {
      for (const method of ["findOne", "create", "update", "remove"] as const) {
        const guards = Reflect.getMetadata(
          GUARDS_METADATA,
          RequestsController.prototype[method],
        );
        expect(guards).toContain(JwtAuthGuard);
        expect(guards).toContain(ActiveAssociationGuard);
        expect(guards).not.toContain(AdminOnlyGuard);
      }
    });

    it("approve and reject require JwtAuthGuard + AdminOnlyGuard, not membership", () => {
      for (const method of ["approve", "reject"] as const) {
        const guards = Reflect.getMetadata(
          GUARDS_METADATA,
          RequestsController.prototype[method],
        );
        expect(guards).toContain(JwtAuthGuard);
        expect(guards).toContain(AdminOnlyGuard);
        expect(guards).not.toContain(ActiveAssociationGuard);
      }
    });
  });

  describe("findAll", () => {
    it("forwards the user, filters and header to the service", async () => {
      mockRequestsService.findAll.mockResolvedValue([mockRequest]);

      const result = await controller.findAll(
        "3",
        { user: mockUser },
        { status: RequestStatus.PENDING },
      );

      expect(result).toEqual([mockRequest]);
      expect(mockRequestsService.findAll).toHaveBeenCalledWith(
        mockUser,
        { status: RequestStatus.PENDING },
        "3",
      );
    });

    it("forwards undefined when no header is provided", async () => {
      mockRequestsService.findAll.mockResolvedValue([]);

      await controller.findAll(undefined, { user: mockUser }, {});

      expect(mockRequestsService.findAll).toHaveBeenCalledWith(
        mockUser,
        {},
        undefined,
      );
    });
  });

  describe("findOne", () => {
    it("returns the request found by the service", async () => {
      mockRequestsService.findOne.mockResolvedValue(mockRequest);

      const result = await controller.findOne("req-1", {
        activeAssociationId: 3,
      });

      expect(result).toEqual(mockRequest);
      expect(mockRequestsService.findOne).toHaveBeenCalledWith("req-1", 3);
    });
  });

  describe("create", () => {
    it("forwards the dto, requester and active association to the service", async () => {
      const dto = {
        type: RequestType.SERVICE,
        servicePayload: { name: "Papelaria Nova" } as any,
      };
      mockRequestsService.create.mockResolvedValue(mockRequest);

      const result = await controller.create(dto as any, {
        user: mockUser,
        activeAssociationId: 3,
      });

      expect(result).toEqual(mockRequest);
      expect(mockRequestsService.create).toHaveBeenCalledWith(dto, mockUser, 3);
    });
  });

  describe("update", () => {
    it("forwards the id, dto and active association to the service", async () => {
      const dto = { servicePayload: { name: "Papelaria Editada" } as any };
      mockRequestsService.update.mockResolvedValue(mockRequest);

      const result = await controller.update("req-1", dto as any, {
        activeAssociationId: 3,
      });

      expect(result).toEqual(mockRequest);
      expect(mockRequestsService.update).toHaveBeenCalledWith("req-1", dto, 3);
    });
  });

  describe("approve", () => {
    it("forwards the id to the service and returns its result", async () => {
      const approvedService = { id: 1, name: "Papelaria D. Beatriz" };
      mockRequestsService.approve.mockResolvedValue(approvedService);

      const result = await controller.approve("req-1");

      expect(result).toEqual(approvedService);
      expect(mockRequestsService.approve).toHaveBeenCalledWith("req-1");
    });
  });

  describe("reject", () => {
    it("forwards the id and dto to the service", async () => {
      const dto = { rejectionReason: "Missing required documents." };
      const rejected = { ...mockRequest, status: RequestStatus.REJECTED };
      mockRequestsService.reject.mockResolvedValue(rejected);

      const result = await controller.reject("req-1", dto);

      expect(result).toEqual(rejected);
      expect(mockRequestsService.reject).toHaveBeenCalledWith("req-1", dto);
    });
  });

  describe("remove", () => {
    it("forwards the id and active association to the service", async () => {
      mockRequestsService.remove.mockResolvedValue(mockRequest);

      const result = await controller.remove("req-1", {
        activeAssociationId: 3,
      });

      expect(result).toEqual(mockRequest);
      expect(mockRequestsService.remove).toHaveBeenCalledWith("req-1", 3);
    });
  });
});
