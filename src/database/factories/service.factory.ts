import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { EnumDays, TimeInterval } from "@/services/entity/timeInterval.entity";
export default setSeederFactory(Service, () => {
  const service = new Service();
  service.name = faker.company.name();
  service.email = faker.internet.email();
  service.location = faker.location.streetAddress();
  service.phoneNumber = faker.phone.number();

  const schedule = new Schedule();
  schedule.timeIntervals = [];
  const days: EnumDays[] = [
    EnumDays.MONDAY,
    EnumDays.TUESDAY,
    EnumDays.WEDNESDAY,
    EnumDays.THURSDAY,
    EnumDays.FRIDAY,
    EnumDays.SATURDAY,
    EnumDays.SUNDAY,
  ];
  const numberOfIntervals = faker.number.int({ min: 1, max: 5 });

  for (let i = 0; i < numberOfIntervals; i++) {
    const timeInterval = new TimeInterval();

    const openingHour = faker.number.int({ min: 8, max: 18 });
    const durationHours = faker.number.int({ min: 1, max: 4 });

    timeInterval.startTime = new Date(
      Date.UTC(1970, 0, 1, openingHour, 0, 0, 0),
    );
    timeInterval.endTime = new Date(
      Date.UTC(1970, 0, 1, openingHour + durationHours, 0, 0, 0),
    );
    timeInterval.dayOfWeek = faker.helpers.arrayElement(days);
    timeInterval.schedule = schedule;
    schedule.timeIntervals.push(timeInterval);
  }

  service.schedule = schedule;

  return service;
});
