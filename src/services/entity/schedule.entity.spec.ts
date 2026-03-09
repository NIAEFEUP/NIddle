import { instanceToPlain, plainToInstance } from "class-transformer";
import { getMetadataArgsStorage } from "typeorm";
import { EnumDays, Schedule } from "./schedule.entity";
import { Service } from "./service.entity";

describe("Schedule Entity", () => {
  it("should create a schedule instance and allow assigning properties", () => {
    const schedule = new Schedule();
    const service = new Service();
    const startTime = "09:00";
    const endTime = "17:00";

    schedule.id = 1;
    schedule.startTime = startTime;
    schedule.endTime = endTime;
    schedule.dayOfWeek = EnumDays.MONDAY;
    schedule.service = service;

    expect(schedule.id).toBe(1);
    expect(schedule.startTime).toBe(startTime);
    expect(schedule.endTime).toBe(endTime);
    expect(schedule.dayOfWeek).toBe(EnumDays.MONDAY);
    expect(schedule.service).toBe(service);
  });

  it("should have correct relationship metadata", () => {
    const metadata = getMetadataArgsStorage();
    const relation = metadata.relations.find(
      (r) => r.target === Schedule && r.propertyName === "service",
    );

    expect(relation).toBeDefined();
    if (relation) {
      const typeFn = relation.type as () => typeof Service;
      expect(typeFn()).toBe(Service);

      const inverseSideFn = relation.inverseSideProperty as (
        service: Service,
      ) => unknown;
      const mockService = { schedule: [] } as unknown as Service;
      expect(inverseSideFn(mockService)).toBe(mockService.schedule);
    }
  });

  it("should use class-transformer decorators correctly", () => {
    const schedule = new Schedule();
    schedule.id = 1;
    schedule.startTime = "09:00";

    const plain = instanceToPlain(schedule);
    expect(plain.id).toBeUndefined();
    expect(plain.startTime).toBe("09:00");

    const scheduleWithService = plainToInstance(Schedule, {
      service: { name: "Test Service" },
    });
    expect(scheduleWithService.service).toBeInstanceOf(Service);
    expect(scheduleWithService.service.name).toBe("Test Service");
  });
});
