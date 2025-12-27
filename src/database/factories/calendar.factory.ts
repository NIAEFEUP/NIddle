import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { Calendar } from '../../calendars/calendar.entity';

export default setSeederFactory(Calendar, () => {
  const calendar = new Calendar();
  calendar.name = `${faker.word.adjective()} ${faker.word.noun()} Calendar`;
  calendar.description = faker.lorem.sentence();
  return calendar;
});
