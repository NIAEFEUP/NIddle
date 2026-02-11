import { Faculty } from "@faculties/entities/faculty.entity";
import { setSeederFactory } from "typeorm-extension";

interface MockedFactory {
  entity: unknown;
  factoryFn: () => Faculty;
}

jest.mock("typeorm-extension", () => ({
  setSeederFactory: jest.fn(
    (entity: unknown, factoryFn: () => unknown): MockedFactory => {
      return { entity, factoryFn: factoryFn as () => Faculty };
    },
  ),
}));

import facultyFactory from "./faculty.factory";

describe("FacultyFactory", () => {
  it("should define a factory for Faculty", () => {
    expect(setSeederFactory).toHaveBeenCalledWith(
      Faculty,
      expect.any(Function),
    );
    const factory = facultyFactory as unknown as MockedFactory;
    expect(factory.entity).toBe(Faculty);
  });

  it("should generate a valid faculty", () => {
    const factory = facultyFactory as unknown as MockedFactory;
    const faculty = factory.factoryFn();

    expect(faculty).toBeInstanceOf(Faculty);
    expect(faculty.name).toBeTruthy();
    expect(faculty.acronym).toBeTruthy();
    expect(faculty.acronym).toMatch(/U/);
  });
});
