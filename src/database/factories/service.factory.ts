import { Schedule } from '../../services/entity/schedule.entity';
import {
  EnumDays,
  TimeInterval,
} from '../../services/entity/timeInterval.entity';
import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { Service } from '../../services/entity/service.entity';

export default setSeederFactory(Service, () => {
  const service = new Service();
  service.name = faker.company.name();
  service.email = faker.internet.email();
  service.location = faker.location.streetAddress();
  service.phoneNumber = faker.phone.number();

  const schedule = new Schedule();
  schedule.timeIntervals = [];
  const days: EnumDays[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const numberOfIntervals = faker.number.int({ min: 1, max: 5 });

  for (let i = 0; i < numberOfIntervals; i++) {
    const timeInterval = new TimeInterval();
    timeInterval.startTime = faker.date.soon({
      refDate: '2024-01-01T08:00:00Z',
    });
    timeInterval.endTime = new Date(
      timeInterval.startTime.getTime() +
        faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000,
    );
    timeInterval.dayOfWeek = faker.helpers.arrayElement(days);
    timeInterval.schedule = schedule;
    schedule.timeIntervals.push(timeInterval);
  }

  service.schedule = schedule;

  return service;
});
