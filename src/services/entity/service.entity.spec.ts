import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Schedule } from "./schedule.entity";
import { Service } from "./service.entity";

describe("Service Entity", () => {
  let service: Service;

  const mockFaculty: Faculty = {
    id: 1,
    name: "Engineering Faculty",
    acronym: "FEUP",
    events: [],
    courses: [],
  };

  const mockCourse: Course = {
    id: 1,
    name: "Computer Science",
    acronym: "CS",
    faculties: [],
    events: [],
  };

  beforeEach(() => {
    service = new Service();
  });

  describe("Relations", () => {
    it("should allow assigning schedule", () => {
      const schedule = new Schedule();
      service.schedule = [schedule];
      expect(service.schedule).toEqual([schedule]);
    });

    it("should allow assigning faculty and course", () => {
      service.faculty = mockFaculty;
      service.course = mockCourse;
      expect(service.faculty).toBe(mockFaculty);
      expect(service.course).toBe(mockCourse);
    });

    it("should allow assigning other properties", () => {
      service.id = 1;
      service.name = "Test";
      service.email = "test@test.com";
      service.location = "Loc";
      service.phoneNumber = "123";
      expect(service.id).toBe(1);
      expect(service.name).toBe("Test");
      expect(service.email).toBe("test@test.com");
      expect(service.location).toBe("Loc");
      expect(service.phoneNumber).toBe("123");
    });
  });

  describe("validateFacultyAndCourses", () => {
    it("should throw when neither faculty nor course are assigned", () => {
      expect(() => service.validateFacultyAndCourses()).toThrow(
        "Exactly one of [faculty, course] must be provided, not neither.",
      );
    });

    it("should not throw when only faculty is assigned", () => {
      service.faculty = mockFaculty;
      expect(() => service.validateFacultyAndCourses()).not.toThrow();
    });

    it("should not throw when only course is assigned", () => {
      service.faculty = null;
      service.course = mockCourse;
      expect(() => service.validateFacultyAndCourses()).not.toThrow();
    });

    it("should throw when both faculty and course are assigned", () => {
      service.faculty = mockFaculty;
      service.course = mockCourse;
      expect(() => service.validateFacultyAndCourses()).toThrow(
        "Exactly one of [faculty, course] must be provided, not both.",
      );
    });
  });
});
