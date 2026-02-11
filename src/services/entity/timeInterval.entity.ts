import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Schedule } from "./schedule.entity";
import { Exclude } from "class-transformer";

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

  @Column({ type: "date" })
  startTime: Date;

  @Column({ type: "date" })
  endTime: Date;

  @Column({
    type: "varchar",
    enum: EnumDays,
    default: EnumDays.MONDAY,
  })
  dayOfWeek: EnumDays;

  @ManyToOne(
    () => Schedule,
    (schedule) => schedule.timeIntervals,
  )
  schedule: Schedule;
}
