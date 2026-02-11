import { setSeederFactory } from "typeorm-extension";
import { Event } from "../../events/entities/event.entity";

interface MockedFactory {
  entity: unknown;
  factoryFn: () => Event;
}

jest.mock("typeorm-extension", () => ({
  setSeederFactory: jest.fn(
    (entity: unknown, factoryFn: () => unknown): MockedFactory => {
      return { entity, factoryFn: factoryFn as () => Event };
    },
  ),
}));

import eventFactory from "./event.factory";

describe("EventFactory", () => {
  it("should define a factory for Event", () => {
    expect(setSeederFactory).toHaveBeenCalledWith(Event, expect.any(Function));
    const factory = eventFactory as unknown as MockedFactory;
    expect(factory.entity).toBe(Event);
  });

  it("should generate a valid event", () => {
    const factory = eventFactory as unknown as MockedFactory;
    const event = factory.factoryFn();

    expect(event).toBeInstanceOf(Event);
    expect(event.name).toBeTruthy();
    expect(event.description).toBeTruthy();
    expect(event.name.length).toBeGreaterThan(0);
  });

  it("should generate event with dates or null dates", () => {
    const factory = eventFactory as unknown as MockedFactory;
    const event = factory.factoryFn();

    // Dates can be either Date objects or null
    if (event.startDate !== null) {
      expect(event.startDate).toBeInstanceOf(Date);
    }
    if (event.endDate !== null) {
      expect(event.endDate).toBeInstanceOf(Date);
    }
  });
});
