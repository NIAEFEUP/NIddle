import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CourseTranslationDto, CreateCourseDto } from "./create-course.dto";

describe("CreateCourseDto", () => {
  it("should be defined", () => {
    expect(CreateCourseDto).toBeDefined();
  });

  it("should have translations property", () => {
    const dto = new CreateCourseDto();
    expect(dto.translations).toBeUndefined();
  });

  it("should validate translations using class-transformer", () => {
    const plain = {
      translations: [{ languageCode: "en", name: "Test", acronym: "T" }],
    };
    const dto = plainToInstance(CreateCourseDto, plain);
    expect(dto.translations).toHaveLength(1);
    expect(dto.translations[0].languageCode).toBe("en");
  });

  it("should allow setting facultyIds", () => {
    const dto = new CreateCourseDto();
    dto.facultyIds = [1, 2];
    expect(dto.facultyIds).toEqual([1, 2]);
  });

  it("should validate valid DTO", async () => {
    const dto = plainToInstance(CreateCourseDto, {
      translations: [{ languageCode: "en", name: "Test", acronym: "T" }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe("CourseTranslationDto", () => {
  it("should be defined", () => {
    expect(CourseTranslationDto).toBeDefined();
  });

  it("should have languageCode, name, acronym properties", () => {
    const dto = new CourseTranslationDto();
    dto.languageCode = "en";
    dto.name = "Course";
    dto.acronym = "C";
    expect(dto.languageCode).toBe("en");
    expect(dto.name).toBe("Course");
    expect(dto.acronym).toBe("C");
  });
});
