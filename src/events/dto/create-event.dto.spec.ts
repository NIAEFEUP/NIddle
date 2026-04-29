import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateEventDto, EventTranslationDto } from "./create-event.dto";

describe("CreateEventDto", () => {
  it("should be defined", () => {
    expect(CreateEventDto).toBeDefined();
  });

  it("should have translations property", () => {
    const dto = new CreateEventDto();
    expect(dto.translations).toBeUndefined();
  });

  it("should validate translations using class-transformer", () => {
    const plain = {
      translations: [
        { languageCode: "en", name: "Event", description: "Desc" },
      ],
      year: 2025,
    };
    const dto = plainToInstance(CreateEventDto, plain);
    expect(dto.translations).toHaveLength(1);
    expect(dto.translations[0].languageCode).toBe("en");
  });

  it("should allow setting year", () => {
    const dto = new CreateEventDto();
    dto.year = 2025;
    expect(dto.year).toBe(2025);
  });

  it("should allow setting facultyId", () => {
    const dto = new CreateEventDto();
    dto.facultyId = 1;
    expect(dto.facultyId).toBe(1);
  });

  it("should allow setting courseIds", () => {
    const dto = new CreateEventDto();
    dto.courseIds = [1, 2];
    expect(dto.courseIds).toEqual([1, 2]);
  });

  it("should validate valid DTO", async () => {
    const dto = plainToInstance(CreateEventDto, {
      translations: [{ languageCode: "en", name: "Event" }],
      year: 2025,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe("EventTranslationDto", () => {
  it("should be defined", () => {
    expect(EventTranslationDto).toBeDefined();
  });

  it("should have languageCode, name, description properties", () => {
    const dto = new EventTranslationDto();
    dto.languageCode = "en";
    dto.name = "Event";
    dto.description = "Description";
    expect(dto.languageCode).toBe("en");
    expect(dto.name).toBe("Event");
    expect(dto.description).toBe("Description");
  });
});
