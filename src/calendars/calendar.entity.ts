import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Faculty } from '../faculties/faculty.entity';
import { Event } from '../events/event.entity';

@Entity()
export class Calendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Faculty, (faculty) => faculty.calendars)
  @JoinTable()
  faculties: Faculty[];

  @ManyToMany(() => Event, (event) => event.calendars)
  @JoinTable()
  events: Event[];
}
