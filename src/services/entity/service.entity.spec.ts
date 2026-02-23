import { Service } from "./service.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Course } from "@/courses/entities/course.entity";

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
    it("should not throw when neither faculty nor courses are assigned", () => {
      expect(() => service.validateFacultyAndCourses()).not.toThrow();
    });

    it("should not throw when only faculty is assigned", () => {
      service.faculty = mockFaculty;
      service.courses = [];
      expect(() => service.validateFacultyAndCourses()).not.toThrow();
    });

    it("should not throw when only courses are assigned", () => {
      service.faculty = undefined as any;
      service.courses = [mockCourse];
      expect(() => service.validateFacultyAndCourses()).not.toThrow();
    });

    it("should throw when both faculty and courses are assigned", () => {
      service.faculty = mockFaculty;
      service.courses = [mockCourse];
      expect(() => service.validateFacultyAndCourses()).toThrow(
        "Service cannot have both faculty and courses assigned. Please choose either a faculty or courses, not both.",
      );
    });
  });
});
