import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { Faculty } from '../../faculties/faculty.entity';

const facultyTypes = ['Faculty', 'School', 'College'];

const facultyNames = [
  'Engineering',
  'Arts',
  'Science',
  'Business',
  'Medicine',
  'Law',
  'Education',
  'Philosophy',
  'Fine Arts',
  'Computer Science',
  'Economics',
];

export default setSeederFactory(Faculty, () => {
  const type = faker.helpers.arrayElement(facultyTypes);
  const field = faker.helpers.arrayElement(facultyNames);
  const city = faker.location.city().replace(/[^a-zA-Z ]/g, '');

  const fullName = `${type} of ${field} of the University of ${city}`;

  const fieldAcronym = field
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('');

  const cityAcronym = city
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('');

  const acronym = `${type[0]}${fieldAcronym}U${cityAcronym}`.toUpperCase();

  const faculty = new Faculty();
  faculty.name = fullName;
  faculty.acronym = acronym;

  return faculty;
});
