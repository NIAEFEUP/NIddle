import { faker } from "@faker-js/faker";
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

      if (event.image !== undefined) {
        expect(event.image).toMatch(/^\/api_images\/events\/.+/);
      }
      if (event.location !== undefined) {
        expect(typeof event.location).toBe("string");
      }
    }
  });

  describe("image and location", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    const pickTemplate = (name: string) => {
      jest
        .spyOn(faker.helpers, "arrayElement")
        .mockImplementation(
          <T>(array: readonly T[]) =>
            array.find((t) => (t as { name: string }).name === name) as T,
        );
      return (eventFactory as unknown as MockedFactory).factoryFn();
    };

    it("should leave academic events without image and location", () => {
      const event = pickTemplate("Christmas Holidays");

      expect(event.image).toBeUndefined();
      expect(event.location).toBeUndefined();
    });

    it.each([
      ["Jantar de Curso", "/api_images/events/jantar_de_curso_1.png"],
      ["SINF - Semana de Informática", "/api_images/events/sinf_2025.jpg"],
      ["Workshop Python", "/api_images/events/workshop_1.png"],
      ["Rally Tascas", "/api_images/events/rally_tascas.jpg"],
    ])("should assign image and location to %s", (name, image) => {
      const event = pickTemplate(name);

      expect(event.name).toBe(name);
      expect(event.image).toBe(image);
      expect(event.location).toBeTruthy();
    });
  });
});
