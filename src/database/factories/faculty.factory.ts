import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { FacultyTranslation } from "@/i18n/entities";

const facultyTypes = ["Faculty", "School", "College"];

const facultyFields: Record<string, { en: string; pt: string }> = {
  Engineering: { en: "Engineering", pt: "Engenharia" },
  Arts: { en: "Arts", pt: "Artes" },
  Science: { en: "Science", pt: "Ciências" },
  Business: { en: "Business", pt: "Economia" },
  Medicine: { en: "Medicine", pt: "Medicina" },
  Law: { en: "Law", pt: "Direito" },
  Education: { en: "Education", pt: "Educação" },
  Philosophy: { en: "Philosophy", pt: "Filosofia" },
  "Fine Arts": { en: "Fine Arts", pt: "Belas-Artes" },
  "Computer Science": { en: "Computer Science", pt: "Informática" },
  Economics: { en: "Economics", pt: "Economia" },
};

export default setSeederFactory(Faculty, () => {
  const type = faker.helpers.arrayElement(facultyTypes);
  const fieldKey = faker.helpers.arrayElement(Object.keys(facultyFields));
  const field = facultyFields[fieldKey];
  const city = faker.location.city().replace(/[^a-zA-Z ]/g, "");

  const fullName = `${type} of ${field.en} of the University of ${city}`;
  const fullNamePt = `${type} de ${field.pt} da Universidade de ${city}`;

  const fieldAcronym = fieldKey
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("");

  const cityAcronym = city
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("");

  const acronym = `${type[0]}${fieldAcronym}U${cityAcronym}`.toUpperCase();

  const faculty = new Faculty();
  faculty.defaultLanguage = "en";

  const enTranslation = new FacultyTranslation();
  enTranslation.languageCode = "en";
  enTranslation.name = fullName;
  enTranslation.acronym = acronym;

  const ptTranslation = new FacultyTranslation();
  ptTranslation.languageCode = "pt";
  ptTranslation.name = fullNamePt;
  ptTranslation.acronym = acronym;

  faculty.translations = [enTranslation, ptTranslation];

  return faculty;
});
