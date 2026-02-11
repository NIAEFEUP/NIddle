import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TimeInterval } from "./timeInterval.entity";
import { Exclude } from "class-transformer";

@Entity()
export class Schedule {
  @Exclude()
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
