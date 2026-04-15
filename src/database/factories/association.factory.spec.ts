import { setSeederFactory } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";

interface MockedFactory {
  entity: unknown;
  factoryFn: () => Association;
}

jest.mock("typeorm-extension", () => ({
  setSeederFactory: jest.fn(
    (entity: unknown, factoryFn: () => unknown): MockedFactory => {
      return { entity, factoryFn: factoryFn as () => Association };
    },
  ),
}));

import associationFactory from "./association.factory";

describe("AssociationFactory", () => {
  it("should define a factory for Association", () => {
    expect(setSeederFactory).toHaveBeenCalledWith(
      Association,
      expect.any(Function),
    );
    const factory = associationFactory as unknown as MockedFactory;
    expect(factory.entity).toBe(Association);
  });

  it("should generate a valid association", () => {
    const factory = associationFactory as unknown as MockedFactory;
    const association = factory.factoryFn();

    expect(association).toBeInstanceOf(Association);
    expect(association.name).toBeTruthy();
    expect(typeof association.name).toBe("string");
  });
});
