import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

export type EnumDays =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

@Entity()
export class TimeInterval {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  dayOfWeek: EnumDays;

  @ManyToOne(() => Schedule, (schedule) => schedule.timeIntervals)
  schedule: Schedule;
}
