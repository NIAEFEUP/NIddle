import { setSeederFactory } from "typeorm-extension";
import { EnumDays, Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";

interface MockedFactory {
  entity: unknown;
  factoryFn: () => Service;
}

jest.mock("typeorm-extension", () => ({
  setSeederFactory: jest.fn(
    (entity: unknown, factoryFn: () => unknown): MockedFactory => {
      return { entity, factoryFn: factoryFn as () => Service };
    },
  ),
}));

import serviceFactory from "./service.factory";

describe("ServiceFactory", () => {
  it("should define a factory for Service", () => {
    expect(setSeederFactory).toHaveBeenCalledWith(
      Service,
      expect.any(Function),
    );
    const factory = serviceFactory as unknown as MockedFactory;
    expect(factory.entity).toBe(Service);
  });

  it("should generate a valid service with schedule and time intervals", () => {
    const factory = serviceFactory as unknown as MockedFactory;
    const service = factory.factoryFn();

    expect(service).toBeInstanceOf(Service);
    expect(service.name).toBeTruthy();
    expect(service.location).toBeTruthy();
    // schedule exists
    expect(Array.isArray(service.schedule)).toBe(true);
    expect(service.schedule.length).toBeGreaterThanOrEqual(1);

    for (const ti of service.schedule) {
      expect(ti).toBeInstanceOf(Schedule);
      expect(typeof ti.startTime).toBe("string");
      expect(typeof ti.endTime).toBe("string");
      expect(Object.values(EnumDays)).toContain(ti.dayOfWeek);
    }
  });
});
