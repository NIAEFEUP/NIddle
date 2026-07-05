import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateFacultyDto, FacultyTranslationDto } from "./create-faculty.dto";

describe("CreateFacultyDto", () => {
  it("should be defined", () => {
    expect(CreateFacultyDto).toBeDefined();
  });

  it("should have translations property", () => {
    const dto = new CreateFacultyDto();
    expect(dto.translations).toBeUndefined();
  });

  it("should validate translations using class-transformer", () => {
    const plain = {
      translations: [{ languageCode: "en", name: "Faculty", acronym: "F" }],
    };
    const dto = plainToInstance(CreateFacultyDto, plain);
    expect(dto.translations).toHaveLength(1);
    expect(dto.translations[0].languageCode).toBe("en");
  });

  it("should allow setting courseIds", () => {
    const dto = new CreateFacultyDto();
    dto.courseIds = [1, 2];
    expect(dto.courseIds).toEqual([1, 2]);
  });

  it("should validate valid DTO", async () => {
    const dto = plainToInstance(CreateFacultyDto, {
      translations: [{ languageCode: "en", name: "Faculty", acronym: "F" }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe("FacultyTranslationDto", () => {
  it("should be defined", () => {
    expect(FacultyTranslationDto).toBeDefined();
  });

  it("should have languageCode, name, acronym properties", () => {
    const dto = new FacultyTranslationDto();
    dto.languageCode = "en";
    dto.name = "Faculty";
    dto.acronym = "F";
    expect(dto.languageCode).toBe("en");
    expect(dto.name).toBe("Faculty");
    expect(dto.acronym).toBe("F");
  });
});
