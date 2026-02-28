import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
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

  describe("validateFacultyAndCourses", () => {
    it("should not throw when neither faculty nor course are assigned", () => {
      expect(() => service.validateFacultyAndCourses()).not.toThrow();
    });

    it("should not throw when only faculty is assigned", () => {
      service.faculty = mockFaculty;
      expect(() => service.validateFacultyAndCourses()).not.toThrow();
    });

    it("should not throw when only course is assigned", () => {
      service.faculty = undefined as any;
      service.course = mockCourse;
      expect(() => service.validateFacultyAndCourses()).not.toThrow();
    });

    it("should throw when both faculty and course are assigned", () => {
      service.faculty = mockFaculty;
      service.course = mockCourse;
      expect(() => service.validateFacultyAndCourses()).toThrow(
        "Service cannot have both faculty and courses assigned. Please choose either a faculty or courses, not both.",
      );
    });
  });
});
