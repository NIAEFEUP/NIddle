import { setSeederFactory } from 'typeorm-extension';
import { Faculty } from '../../faculties/faculty.entity';

export default setSeederFactory(Faculty, (faker) => {
  const faculty = new Faculty();
  faculty.name = faker.company.name();
  faculty.acronym = faculty.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return faculty;
});
