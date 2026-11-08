import type { DataSource } from "typeorm";
import type { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";
import { Event } from "@/events/entities/event.entity";
import {
  Request,
  RequestAction,
  RequestStatus,
  RequestType,
} from "@/requests/entities/request.entity";
import { EnumDays } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";

export default class RequestSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const associationRepo = dataSource.getRepository(Association);
    const userRepo = dataSource.getRepository(User);
    const eventRepo = dataSource.getRepository(Event);
    const serviceRepo = dataSource.getRepository(Service);
    const requestRepo = dataSource.getRepository(Request);

    const associations = await associationRepo.find({
      relations: { users: true },
    });
    if (associations.length === 0) return;

    const users = await userRepo.find({ relations: { associations: true } });
    const events = await eventRepo.find({ relations: { createdBy: true } });
    const services = await serviceRepo.find({ relations: { createdBy: true } });

    const getRequesterForAssociation = (assoc: Association): User | null => {
      if (assoc.users && assoc.users.length > 0) {
        return assoc.users[0];
      }
      const member = users.find((u) =>
        u.associations?.some((a) => a.id === assoc.id),
      );
      if (member) return member;
      return users[0] || null;
    };

    const requests: Partial<Request>[] = [];
    const now = new Date();
    const daysAgo = (days: number) =>
      new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const assoc1 = associations[0];
    const assoc2 = associations[1] || assoc1;
    const assoc3 = associations[2] || assoc2;

    requests.push({
      action: RequestAction.CREATE,
      type: RequestType.EVENT,
      status: RequestStatus.PENDING,
      targetAssociation: assoc1,
      requestedBy: getRequesterForAssociation(assoc1),
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
      reviewedAt: null,
      rejectionReason: null,
      payload: {
        name: "HackFEUP 2026",
        description:
          "Annual 24-hour hackathon bringing together students to solve real-world problems. Features tech workshops, industry mentors, and sponsor challenges.",
        year: 2026,
        startDate: new Date(now.getFullYear(), 10, 14, 9, 0).toISOString(),
        endDate: new Date(now.getFullYear(), 10, 15, 17, 0).toISOString(),
      },
    });

    requests.push({
      action: RequestAction.CREATE,
      type: RequestType.EVENT,
      status: RequestStatus.PENDING,
      targetAssociation: assoc2,
      requestedBy: getRequesterForAssociation(assoc2),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
      reviewedAt: null,
      rejectionReason: null,
      payload: {
        name: "Spring Chess Tournament",
        description:
          "Open swiss-system chess championship across all faculties. 5 rounds of rapid chess with official digital clocks and prizes for top finishers.",
        year: 2026,
        startDate: new Date(now.getFullYear(), 4, 10, 14, 0).toISOString(),
        endDate: new Date(now.getFullYear(), 4, 10, 19, 0).toISOString(),
      },
    });

    requests.push({
      action: RequestAction.CREATE,
      type: RequestType.SERVICE,
      status: RequestStatus.PENDING,
      targetAssociation: assoc1,
      requestedBy: getRequesterForAssociation(assoc1),
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
      reviewedAt: null,
      rejectionReason: null,
      payload: {
        name: "Embedded Systems & IoT Lending Hub",
        location: "Building I, Room I-105",
        email: "iot-lab@niddle.fe.up.pt",
        phoneNumber: "+351 220 413 000",
        schedule: [
          {
            dayOfWeek: EnumDays.MONDAY,
            startTime: "14:00",
            endTime: "18:00",
          },
          {
            dayOfWeek: EnumDays.WEDNESDAY,
            startTime: "14:00",
            endTime: "18:00",
          },
          {
            dayOfWeek: EnumDays.FRIDAY,
            startTime: "10:00",
            endTime: "14:00",
          },
        ],
      },
    });

    requests.push({
      action: RequestAction.CREATE,
      type: RequestType.SERVICE,
      status: RequestStatus.PENDING,
      targetAssociation: assoc3,
      requestedBy: getRequesterForAssociation(assoc3),
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
      reviewedAt: null,
      rejectionReason: null,
      payload: {
        name: "Exam Preparation Archive & Tutoring",
        location: "Student Center, Lounge B",
        email: "tutoring@niddle.fe.up.pt",
        phoneNumber: "+351 220 413 111",
        schedule: [
          {
            dayOfWeek: EnumDays.TUESDAY,
            startTime: "16:00",
            endTime: "19:00",
          },
          {
            dayOfWeek: EnumDays.THURSDAY,
            startTime: "16:00",
            endTime: "19:00",
          },
        ],
      },
    });

    if (events.length > 0) {
      const targetEvent = events[0];
      const targetAssoc = targetEvent.createdBy || assoc1;
      requests.push({
        action: RequestAction.UPDATE_EXISTING,
        type: RequestType.EVENT,
        status: RequestStatus.PENDING,
        targetAssociation: targetAssoc,
        targetEvent,
        requestedBy: getRequesterForAssociation(targetAssoc),
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
        reviewedAt: null,
        rejectionReason: null,
        payload: {
          name: targetEvent.name,
          description: `${targetEvent.description || "Student association event."} (Updated: Venue moved to Grand Auditorium B032 to accommodate higher capacity).`,
          year: targetEvent.year || 2026,
        } as any,
      });
    }

    if (services.length > 0) {
      const targetService = services[0];
      const targetAssoc = targetService.createdBy || assoc2;
      requests.push({
        action: RequestAction.UPDATE_EXISTING,
        type: RequestType.SERVICE,
        status: RequestStatus.PENDING,
        targetAssociation: targetAssoc,
        targetService: null,
        requestedBy: getRequesterForAssociation(targetAssoc),
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
        reviewedAt: null,
        rejectionReason: null,
        payload: {
          name: targetService.name,
          location: "Building B - Ground Floor Office (New permanent location)",
          email: "support@niddle.fe.up.pt",
        } as any,
      });
    }

    if (events.length > 1) {
      const targetEvent = events[1];
      const targetAssoc = targetEvent.createdBy || assoc3;
      requests.push({
        action: RequestAction.DELETE_EXISTING,
        type: RequestType.EVENT,
        status: RequestStatus.PENDING,
        targetAssociation: targetAssoc,
        targetEvent,
        requestedBy: getRequesterForAssociation(targetAssoc),
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
        reviewedAt: null,
        rejectionReason: null,
        payload: null,
      });
    }

    requests.push({
      action: RequestAction.CREATE,
      type: RequestType.EVENT,
      status: RequestStatus.APPROVED,
      targetAssociation: assoc1,
      requestedBy: getRequesterForAssociation(assoc1),
      createdAt: daysAgo(10),
      updatedAt: daysAgo(8),
      reviewedAt: daysAgo(8),
      rejectionReason: null,
      payload: {
        name: "Freshmen Welcome Gala",
        description:
          "Traditional welcome celebration for newly admitted students featuring musical performances and networking with student clubs.",
        year: 2026,
        startDate: new Date(now.getFullYear(), 9, 20, 19, 0).toISOString(),
        endDate: new Date(now.getFullYear(), 9, 21, 2, 0).toISOString(),
      },
    });

    requests.push({
      action: RequestAction.CREATE,
      type: RequestType.SERVICE,
      status: RequestStatus.APPROVED,
      targetAssociation: assoc2,
      requestedBy: getRequesterForAssociation(assoc2),
      createdAt: daysAgo(12),
      updatedAt: daysAgo(9),
      reviewedAt: daysAgo(9),
      rejectionReason: null,
      payload: {
        name: "3D Rapid Prototyping Workshop",
        location: "Makerspace, Building H",
        email: "makerspace@niddle.fe.up.pt",
        phoneNumber: "+351 220 413 222",
        schedule: [
          {
            dayOfWeek: EnumDays.MONDAY,
            startTime: "10:00",
            endTime: "17:00",
          },
          {
            dayOfWeek: EnumDays.WEDNESDAY,
            startTime: "10:00",
            endTime: "17:00",
          },
        ],
      },
    });

    requests.push({
      action: RequestAction.CREATE,
      type: RequestType.EVENT,
      status: RequestStatus.REJECTED,
      targetAssociation: assoc3,
      requestedBy: getRequesterForAssociation(assoc3),
      createdAt: daysAgo(7),
      updatedAt: daysAgo(5),
      reviewedAt: daysAgo(5),
      rejectionReason:
        "The proposed event dates conflict with the university mid-term examination week. Please select dates outside the assessment calendar.",
      payload: {
        name: "Midterm Gaming Tournament",
        description:
          "All-night esports competition hosted on faculty computer cluster.",
        year: 2026,
        startDate: new Date(now.getFullYear(), 0, 15, 18, 0).toISOString(),
        endDate: new Date(now.getFullYear(), 0, 16, 6, 0).toISOString(),
      },
    });

    requests.push({
      action: RequestAction.CREATE,
      type: RequestType.EVENT,
      status: RequestStatus.REJECTED,
      targetAssociation: assoc1,
      requestedBy: getRequesterForAssociation(assoc1),
      createdAt: daysAgo(6),
      updatedAt: daysAgo(4),
      reviewedAt: daysAgo(4),
      rejectionReason:
        "Indoor fireworks and pyrotechnics are strictly prohibited in the auditorium under campus safety regulations. Please revise the activity plan.",
      payload: {
        name: "End of Semester Rave",
        description:
          "Electronic music event with indoor light and pyrotechnic effects in Main Auditorium.",
        year: 2026,
        startDate: new Date(now.getFullYear(), 5, 28, 21, 0).toISOString(),
        endDate: new Date(now.getFullYear(), 5, 29, 4, 0).toISOString(),
      },
    });

    if (services.length > 1) {
      const targetService = services[1];
      const targetAssoc = targetService.createdBy || assoc2;
      requests.push({
        action: RequestAction.DELETE_EXISTING,
        type: RequestType.SERVICE,
        status: RequestStatus.APPROVED,
        targetAssociation: targetAssoc,
        targetService: null,
        requestedBy: getRequesterForAssociation(targetAssoc),
        createdAt: daysAgo(14),
        updatedAt: daysAgo(11),
        reviewedAt: daysAgo(11),
        rejectionReason: null,
        payload: null,
      });
    }

    const createdRequests = requestRepo.create(requests);
    await requestRepo.save(createdRequests);
  }
}
