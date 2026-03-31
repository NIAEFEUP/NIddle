import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";

const associationNames = [
  "Chess Club",
  "Debate Society",
  "Photography Club",
  "Music Association",
  "Sports Federation",
  "Gaming Club",
  "Environmental Society",
  "Robotics Club",
  "Drama Club",
  "Film Society",
  "Literature Circle",
  "Astronomy Club",
  "Dance Crew",
  "Volunteer Association",
  "Tech Innovation Hub",
];

export default setSeederFactory(Association, () => {
  const association = new Association();
  association.name = faker.helpers.arrayElement(associationNames);

  return association;
});
