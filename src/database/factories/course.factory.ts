import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Course } from "../../courses/entities/course.entity";

const degreeTypes = ["Bachelor", "Master", "PhD"];

const fields = [
  "Informatics Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Bioengineering",
  "Environmental Engineering",
  "Industrial Engineering",
  "Data Science",
  "Artificial Intelligence",
];

export default setSeederFactory(Course, () => {
  const type = faker.helpers.arrayElement(degreeTypes);
  const field = faker.helpers.arrayElement(fields);

  const name = `${type} in ${field}`;

  const typeAcronym = type[0];
  const fieldAcronym = field
    .split(" ")
    .map((word) => word[0])
    .join("");

  const acronym = `${typeAcronym}${fieldAcronym}`.toUpperCase();

  const course = new Course();
  course.name = name;
  course.acronym = acronym;

  return course;
});
