import type { DataSource, EntityTarget } from "typeorm";
import type { SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { Event } from "@/events/entities/event.entity";
import {
  Request,
  RequestAction,
  RequestStatus,
  RequestType,
} from "@/requests/entities/request.entity";
import type { CreateServiceDto } from "@/services/dto/create-service.dto";
import { EnumDays } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import RequestSeeder from "./7-request.seeder";

describe("RequestSeeder", () => {
  let seeder: RequestSeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockUsers: any[] = [
    {
      id: "u1",
      name: "Admin User",
      email: "admin@example.com",
      associations: [{ id: "a1" }],
    },
  ];

  const mockAssociations: any[] = [
    {
      id: "a1",
      name: "Chess Club",
      acronym: "CC",
      users: [mockUsers[0]],
    },
    {
      id: "a2",
      name: "Environmental Society",
      acronym: "ES",
      users: [],
    },
  ];

  const mockEvents: any[] = [
    {
      id: "e1",
      name: "Existing Tournament",
      description: "Old description",
      year: 2026,
      createdBy: mockAssociations[0],
    },
    {
      id: "e2",
      name: "Old Workshop",
      createdBy: mockAssociations[1],
    },
  ];

  const mockServices: any[] = [
    {
      id: "s1",
      name: "Existing Printing",
      createdBy: mockAssociations[0],
    },
    {
      id: "s2",
      name: "Old Equipment Lending",
      createdBy: mockAssociations[1],
    },
  ];

  beforeEach(() => {
    seeder = new RequestSeeder();
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(seeder).toBeDefined();
  });

  it("should seed realistic requests when associations exist", async () => {
    const mockRequestRepository = {
      create: jest.fn().mockImplementation((reqs) => reqs),
      save: jest.fn().mockImplementation(async (reqs) => reqs),
    };

    const mockAssociationRepository = {
      find: jest.fn().mockResolvedValue(mockAssociations),
    };

    const mockUserRepository = {
      find: jest.fn().mockResolvedValue(mockUsers),
    };

    const mockEventRepository = {
      find: jest.fn().mockResolvedValue(mockEvents),
    };

    const mockServiceRepository = {
      find: jest.fn().mockResolvedValue(mockServices),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<any>) => {
      if (entity === Request) return mockRequestRepository;
      if (entity === Association) return mockAssociationRepository;
      if (entity === User) return mockUserRepository;
      if (entity === Event) return mockEventRepository;
      if (entity === Service) return mockServiceRepository;
    });

    dataSource = {
      getRepository: getRepositoryMock,
    } as unknown as DataSource;

    factoryManager = {} as unknown as SeederFactoryManager;

    await seeder.run(dataSource, factoryManager);

    expect(mockAssociationRepository.find).toHaveBeenCalled();
    expect(mockRequestRepository.create).toHaveBeenCalled();
    const savedRequests: Partial<Request>[] =
      mockRequestRepository.create.mock.calls[0][0];
    expect(mockRequestRepository.save).toHaveBeenCalledWith(savedRequests);

    // Ensure we have pending, approved, and rejected requests
    const pendingReqs = savedRequests.filter(
      (r) => r.status === RequestStatus.PENDING,
    );
    const approvedReqs = savedRequests.filter(
      (r) => r.status === RequestStatus.APPROVED,
    );
    const rejectedReqs = savedRequests.filter(
      (r) => r.status === RequestStatus.REJECTED,
    );

    expect(pendingReqs.length).toBeGreaterThan(0);
    expect(approvedReqs.length).toBeGreaterThan(0);
    expect(rejectedReqs.length).toBeGreaterThan(0);

    expect(savedRequests.some((r) => r.action === RequestAction.CREATE)).toBe(
      true,
    );
    expect(
      savedRequests.some((r) => r.action === RequestAction.UPDATE_EXISTING),
    ).toBe(true);
    expect(
      savedRequests.some((r) => r.action === RequestAction.DELETE_EXISTING),
    ).toBe(true);

    expect(savedRequests.some((r) => r.type === RequestType.EVENT)).toBe(true);
    expect(savedRequests.some((r) => r.type === RequestType.SERVICE)).toBe(
      true,
    );

    for (const rej of rejectedReqs) {
      expect(rej.rejectionReason).toBeTruthy();
    }

    const approvedDeletion = savedRequests.find(
      (r) =>
        r.action === RequestAction.DELETE_EXISTING &&
        r.status === RequestStatus.APPROVED,
    );
    if (approvedDeletion) {
      expect(approvedDeletion.targetService).toBeNull();
    }

    const serviceRequestsWithSchedule = savedRequests.filter(
      (r) =>
        r.type === RequestType.SERVICE &&
        r.payload &&
        "schedule" in r.payload &&
        Array.isArray((r.payload as CreateServiceDto).schedule),
    );
    for (const req of serviceRequestsWithSchedule) {
      const schedule = (req.payload as CreateServiceDto).schedule;
      if (schedule) {
        for (const slot of schedule) {
          expect(Object.values(EnumDays)).toContain(slot.dayOfWeek);
          expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/);
          expect(slot.endTime).toMatch(/^\d{2}:\d{2}$/);
        }
      }
    }
  });

  it("should do nothing if no associations exist", async () => {
    const mockRequestRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockAssociationRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const getRepositoryMock = jest.fn((entity: EntityTarget<any>) => {
      if (entity === Request) return mockRequestRepository;
      if (entity === Association) return mockAssociationRepository;
      return { find: jest.fn().mockResolvedValue([]) };
    });

    dataSource = {
      getRepository: getRepositoryMock,
    } as unknown as DataSource;

    factoryManager = {} as unknown as SeederFactoryManager;

    await seeder.run(dataSource, factoryManager);

    expect(mockRequestRepository.save).not.toHaveBeenCalled();
  });
});
