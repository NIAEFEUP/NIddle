import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
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

  @ManyToOne(() => Faculty, (faculty) => faculty.calendars)
  faculty: Faculty;

  @ManyToMany(() => Event, (event) => event.calendars)
  @JoinTable()
  events: Event[];
}
