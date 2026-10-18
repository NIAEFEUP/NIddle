import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { EVENT_SORT_FIELDS, EventFilterDto } from "./event-filter.dto";

describe("EventFilterDto", () => {
  const validUuid1 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
  const validUuid2 = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
  const validUuid3 = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";

  it("converts numeric strings to numbers for year and handles UUIDs/dates", () => {
    const plain = {
      year: "2025",
      facultyId: validUuid1,
      courseId: validUuid2,
      createdById: validUuid3,
      startDateFrom: "2025-01-01T00:00:00.000Z",
      startDateTo: "2025-12-31T23:59:59.999Z",
    };
    const inst = plainToInstance(EventFilterDto, plain);

    expect(typeof inst.year).toBe("number");
    expect(inst.year).toBe(2025);
    expect(inst.facultyId).toBe(validUuid1);
    expect(inst.courseId).toBe(validUuid2);
    expect(inst.createdById).toBe(validUuid3);
    expect(inst.startDateFrom).toBeInstanceOf(Date);
    expect(inst.startDateTo).toBeInstanceOf(Date);
  });

  it("keeps properties undefined when not provided", () => {
    const inst = plainToInstance(EventFilterDto, {});
    expect(inst.year).toBeUndefined();
    expect(inst.facultyId).toBeUndefined();
    expect(inst.courseId).toBeUndefined();
    expect(inst.createdById).toBeUndefined();
    expect(inst.startDateFrom).toBeUndefined();
    expect(inst.startDateTo).toBeUndefined();
    expect(inst.sortBy).toBeUndefined();
    expect(inst.sortOrder).toBeUndefined();
  });

  describe("Validation", () => {
    it("accepts valid filter values", async () => {
      const dto = plainToInstance(EventFilterDto, {
        year: 2025,
        facultyId: validUuid1,
        courseId: validUuid2,
        createdById: validUuid3,
        startDateFrom: "2025-01-01T00:00:00.000Z",
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("rejects invalid UUIDs", async () => {
      const dto = plainToInstance(EventFilterDto, {
        createdById: "invalid-uuid",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "createdById")).toBe(true);
    });
  });

  describe("sortBy / sortOrder", () => {
    it.each(
      EVENT_SORT_FIELDS,
    )("accepts %s as a valid sortBy value", async (sortBy) => {
      const dto = plainToInstance(EventFilterDto, { sortBy });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("rejects a sortBy value that isn't whitelisted", async () => {
      const dto = plainToInstance(EventFilterDto, { sortBy: "description" });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "sortBy")).toBe(true);
    });

    it.each([
      "ASC",
      "DESC",
    ])("accepts %s as a valid sortOrder", async (sortOrder) => {
      const dto = plainToInstance(EventFilterDto, {
        sortBy: "name",
        sortOrder,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
