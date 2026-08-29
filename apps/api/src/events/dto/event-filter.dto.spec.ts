import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { EventFilterDto } from "./event-filter.dto";

describe("EventFilterDto", () => {
  it("converts numeric strings to numbers for year using @Type and keeps UUID strings", () => {
    const plain = {
      year: "2025",
      facultyId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      courseId: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    };
    const inst = plainToInstance(EventFilterDto, plain);

    expect(typeof inst.year).toBe("number");
    expect(inst.year).toBe(2025);

    expect(typeof inst.facultyId).toBe("string");
    expect(inst.facultyId).toBe("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22");

    expect(typeof inst.courseId).toBe("string");
    expect(inst.courseId).toBe("c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33");
  });

  it("keeps properties undefined when not provided", () => {
    const inst = plainToInstance(EventFilterDto, {});
    expect(inst.year).toBeUndefined();
    expect(inst.facultyId).toBeUndefined();
    expect(inst.courseId).toBeUndefined();
  });
});
