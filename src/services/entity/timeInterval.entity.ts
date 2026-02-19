import { Exclude } from "class-transformer";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Service } from "./service.entity";

export enum EnumDays {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

@Entity()
export class TimeInterval {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: Date })
  startTime: Date;

  @Column({ type: Date })
  endTime: Date;

  @Column({
    type: "varchar",
    enum: EnumDays,
    default: EnumDays.MONDAY,
  })
  dayOfWeek: EnumDays;

  @ManyToOne(
    () => Service,
    (service) => service.schedule,
  )
  service: Service;
}
