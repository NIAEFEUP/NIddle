import { setSeederFactory } from "typeorm-extension";
import { Event } from "@/events/entities/event.entity";
import eventFactory from "./event.factory";

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

describe("EventFactory", () => {
  it("should define a factory for Event", () => {
    expect(setSeederFactory).toHaveBeenCalledWith(Event, expect.any(Function));
    const factory = eventFactory as unknown as MockedFactory;
    expect(factory.entity).toBe(Event);
  });

  it("should generate a valid event with varying date combinations", () => {
    const factory = eventFactory as unknown as MockedFactory;

    for (let i = 0; i < 100; i++) {
      const event = factory.factoryFn();

      expect(event).toBeInstanceOf(Event);
      expect(event.name).toBeTruthy();
      expect(event.description).toBeTruthy();

      if (event.startDate) {
        expect(event.startDate).toBeInstanceOf(Date);
      } else {
        expect(event.startDate).toBeNull();
      }

      if (event.endDate) {
        expect(event.endDate).toBeInstanceOf(Date);
      } else {
        expect(event.endDate).toBeNull();
      }
    }
  });
});
