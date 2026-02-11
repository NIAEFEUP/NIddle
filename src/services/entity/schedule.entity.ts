import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TimeInterval } from "./timeInterval.entity";

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToMany(
    () => TimeInterval,
    (timeInterval) => timeInterval.schedule,
    {
      cascade: true,
    },
  )
  timeIntervals: TimeInterval[];
}
