import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { EnumDays } from "@/services/entity/schedule.entity";
import { CreateScheduleDto } from "./create-schedule.dto";

describe("CreateScheduleDto validation", () => {
  it("valid dto should have no validation errors", async () => {
    const dto = new CreateScheduleDto();
    dto.startTime = "09:00";
    dto.endTime = "17:00";
    dto.dayOfWeek = EnumDays.MONDAY;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  describe("startTime", () => {
    it("should reject a missing startTime", async () => {
      const dto = new CreateScheduleDto();
      dto.endTime = "17:00";
      dto.dayOfWeek = EnumDays.MONDAY;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "startTime")).toBe(true);
    });

    it("should reject a non-military-time startTime", async () => {
      const dto = new CreateScheduleDto();
      dto.startTime = "9am";
      dto.endTime = "17:00";
      dto.dayOfWeek = EnumDays.MONDAY;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "startTime")).toBe(true);
    });

    it("should reject a non-string startTime", async () => {
      const dto = new CreateScheduleDto();
      dto.startTime = 900 as any;
      dto.endTime = "17:00";
      dto.dayOfWeek = EnumDays.MONDAY;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "startTime")).toBe(true);
    });
  });

  describe("endTime", () => {
    it("should reject a missing endTime", async () => {
      const dto = new CreateScheduleDto();
      dto.startTime = "09:00";
      dto.dayOfWeek = EnumDays.MONDAY;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "endTime")).toBe(true);
    });

    it("should reject a non-military-time endTime", async () => {
      const dto = new CreateScheduleDto();
      dto.startTime = "09:00";
      dto.endTime = "25:99";
      dto.dayOfWeek = EnumDays.MONDAY;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "endTime")).toBe(true);
    });
  });

  describe("dayOfWeek", () => {
    it("should reject a missing dayOfWeek", async () => {
      const dto = new CreateScheduleDto();
      dto.startTime = "09:00";
      dto.endTime = "17:00";

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "dayOfWeek")).toBe(true);
    });

    it("should reject a dayOfWeek outside the EnumDays values", async () => {
      const dto = new CreateScheduleDto();
      dto.startTime = "09:00";
      dto.endTime = "17:00";
      dto.dayOfWeek = "Someday" as EnumDays;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === "dayOfWeek")).toBe(true);
    });

    it("should accept every EnumDays value", async () => {
      for (const day of Object.values(EnumDays)) {
        const dto = new CreateScheduleDto();
        dto.startTime = "09:00";
        dto.endTime = "17:00";
        dto.dayOfWeek = day;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });
  });

  it("should transform a plain object into a CreateScheduleDto instance", () => {
    const plain = { startTime: "09:00", endTime: "17:00", dayOfWeek: "Monday" };

    const dto = plainToInstance(CreateScheduleDto, plain);

    expect(dto).toBeInstanceOf(CreateScheduleDto);
    expect(dto.startTime).toBe("09:00");
    expect(dto.endTime).toBe("17:00");
    expect(dto.dayOfWeek).toBe(EnumDays.MONDAY);
  });

  it("only carries the fields a client should send (no id/service)", () => {
    const dto = plainToInstance(CreateScheduleDto, {
      startTime: "09:00",
      endTime: "17:00",
      dayOfWeek: "Monday",
    });

    expect(dto).not.toHaveProperty("id");
    expect(dto).not.toHaveProperty("service");
  });
});
