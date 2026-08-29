import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";

@Entity()
export class Faculty {
  /**
   * The unique identifier (UUID) of the faculty.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

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
   * @example [{ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Bachelor in Informatics and Computing Engineering', acronym: 'LEIC' }]
   */
  @ManyToMany(
    () => Course,
    (course) => course.faculties,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinTable()
  courses: Course[];

  /**
   * Events associated with this faculty.
   */
  @OneToMany(
    () => Event,
    (event) => event.faculty,
  )
  events: Event[];
}
