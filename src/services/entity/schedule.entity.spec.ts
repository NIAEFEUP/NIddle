import { EnumDays, Schedule } from "./schedule.entity";
import { Service } from "./service.entity";

describe("Schedule Entity", () => {
  it("should create a schedule instance and allow assigning properties", () => {
    const schedule = new Schedule();
    const service = new Service();
    const startTime = new Date();
    const endTime = new Date();

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
});
