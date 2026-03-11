import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { EnumDays, Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
export default setSeederFactory(Service, () => {
  const service = new Service();
  service.name = faker.company.name();
  service.email = faker.internet.email();
  service.location = faker.location.streetAddress();
  service.phoneNumber = faker.phone.number();

  const schedule: Schedule[] = [];
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
    const timeInterval = new Schedule();

    const openingHour = faker.number.int({ min: 8, max: 18 });
    const durationHours = faker.number.int({ min: 1, max: 4 });

    timeInterval.startTime = `${openingHour.toString().padStart(2, "0")}:00`;
    timeInterval.endTime = `${(openingHour + durationHours)
      .toString()
      .padStart(2, "0")}:00`;
    timeInterval.dayOfWeek = faker.helpers.arrayElement(days);
    schedule.push(timeInterval);
  }

  service.schedule = schedule;

  return service;
});
