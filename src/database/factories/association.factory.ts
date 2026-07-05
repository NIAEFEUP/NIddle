import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Association } from "@/associations/entities/association.entity";

const associations = [
  { name: "Chess Club", acronym: "CC" },
  { name: "Debate Society", acronym: "DS" },
  { name: "Photography Club", acronym: "PC" },
  { name: "Music Association", acronym: "MA" },
  { name: "Sports Federation", acronym: "SF" },
  { name: "Gaming Club", acronym: "GC" },
  { name: "Environmental Society", acronym: "ES" },
  { name: "Robotics Club", acronym: "RC" },
  { name: "Drama Club", acronym: "DC" },
  { name: "Film Society", acronym: "FS" },
  { name: "Literature Circle", acronym: "LC" },
  { name: "Astronomy Club", acronym: "AC" },
  { name: "Dance Crew", acronym: "DC" },
  { name: "Volunteer Association", acronym: "VA" },
  { name: "Tech Innovation Hub", acronym: "TIH" },
];

export default setSeederFactory(Association, () => {
  const association = new Association();
  const data = faker.helpers.arrayElement(associations);
  association.name = data.name;
  association.acronym = data.acronym;

  return association;
});
