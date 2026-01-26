import { Course } from '../../courses/entities/course.entity';
import { Event } from '../../events/entities/event.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

@Entity()
export class Faculty {
  /**
   * The unique identifier of the faculty.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The name of the faculty.
   * @example 'Faculty of Engineering'
   */
  @Column()
  name: string;

  /**
   * The acronym of the faculty.
   * @example 'FEUP'
   */
  @Column()
  acronym: string;

  /**
   * The courses associated with the faculty.
   * @example [{ id: 1, name: 'Bachelor in Informatics and Computing Engineering', acronym: 'LEIC' }]
   */
  @ManyToMany(() => Course, (course) => course.faculties, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  courses: Course[];

  /**
   * Events associated with this faculty.
   */
  @OneToMany(() => Event, (event) => event.faculty)
  events: Event[];
}
