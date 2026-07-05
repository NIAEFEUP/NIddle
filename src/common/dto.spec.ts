import { Test, TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

describe("DTO Tests", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({}).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  describe("CourseTranslationDto", () => {
    it("should validate with correct data", async () => {
      const { CourseTranslationDto } = await import(
        "@/courses/dto/create-course.dto"
      );
      const dto = plainToInstance(CourseTranslationDto, {
        languageCode: "en",
        name: "Computer Science",
        acronym: "CS",
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe("CreateCourseDto", () => {
    it("should be defined", async () => {
      const { CreateCourseDto } = await import(
        "@/courses/dto/create-course.dto"
      );
      expect(new CreateCourseDto()).toBeDefined();
    });
  });

  describe("EventTranslationDto", () => {
    it("should validate with correct data", async () => {
      const { EventTranslationDto } = await import(
        "@/events/dto/create-event.dto"
      );
      const dto = plainToInstance(EventTranslationDto, {
        languageCode: "en",
        name: "FEUP Week",
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe("CreateEventDto", () => {
    it("should be defined", async () => {
      const { CreateEventDto } = await import("@/events/dto/create-event.dto");
      expect(new CreateEventDto()).toBeDefined();
    });
  });

  describe("FacultyTranslationDto", () => {
    it("should validate with correct data", async () => {
      const { FacultyTranslationDto } = await import(
        "@/faculties/dto/create-faculty.dto"
      );
      const dto = plainToInstance(FacultyTranslationDto, {
        languageCode: "en",
        name: "Faculty of Engineering",
        acronym: "FEUP",
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe("CreateFacultyDto", () => {
    it("should be defined", async () => {
      const { CreateFacultyDto } = await import(
        "@/faculties/dto/create-faculty.dto"
      );
      expect(new CreateFacultyDto()).toBeDefined();
    });
  });
});
