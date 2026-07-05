import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Course } from "@/courses/entities/course.entity";
import { CourseTranslation } from "@/i18n/entities";

const degreeTypes = ["Bachelor", "Master", "PhD"];

const fields: Record<string, { en: string; pt: string }> = {
  "Informatics Engineering": {
    en: "Informatics Engineering",
    pt: "Engenharia Informática",
  },
  "Civil Engineering": { en: "Civil Engineering", pt: "Engenharia Civil" },
  "Mechanical Engineering": {
    en: "Mechanical Engineering",
    pt: "Engenharia Mecânica",
  },
  "Electrical Engineering": {
    en: "Electrical Engineering",
    pt: "Engenharia Eletrotécnica",
  },
  "Chemical Engineering": {
    en: "Chemical Engineering",
    pt: "Engenharia Química",
  },
  Bioengineering: { en: "Bioengineering", pt: "Bioengenharia" },
  "Environmental Engineering": {
    en: "Environmental Engineering",
    pt: "Engenharia do Ambiente",
  },
  "Industrial Engineering": {
    en: "Industrial Engineering",
    pt: "Engenharia Industrial",
  },
  "Data Science": { en: "Data Science", pt: "Ciência de Dados" },
  "Artificial Intelligence": {
    en: "Artificial Intelligence",
    pt: "Inteligência Artificial",
  },
};

const degreeNames: Record<string, { en: string; pt: string }> = {
  Bachelor: { en: "Bachelor", pt: "Licenciatura" },
  Master: { en: "Master", pt: "Mestrado" },
  PhD: { en: "PhD", pt: "Doutoramento" },
};

export default setSeederFactory(Course, () => {
  const type = faker.helpers.arrayElement(degreeTypes);
  const fieldKey = faker.helpers.arrayElement(Object.keys(fields));
  const field = fields[fieldKey];

  const name = `${type} in ${field.en}`;
  const namePt = `${degreeNames[type].pt} em ${field.pt}`;

  const typeAcronym = type[0];
  const fieldAcronym = fieldKey
    .split(" ")
    .map((word) => word[0])
    .join("");

  const acronym = `${typeAcronym}${fieldAcronym}`.toUpperCase();

  const course = new Course();
  course.defaultLanguage = "en";

  const enTranslation = new CourseTranslation();
  enTranslation.languageCode = "en";
  enTranslation.name = name;
  enTranslation.acronym = acronym;

  const ptTranslation = new CourseTranslation();
  ptTranslation.languageCode = "pt";
  ptTranslation.name = namePt;
  ptTranslation.acronym = acronym;

  course.translations = [enTranslation, ptTranslation];

  return course;
});
