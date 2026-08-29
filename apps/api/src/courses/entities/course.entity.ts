import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";

@Entity()
export class Course {
  /**
   * The unique identifier (UUID) of the course.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /**
   * The name of the course.
   * @example 'Bachelor in Informatics and Computing Engineering'
   */
  @Column()
  name: string;

  /**
   * The acronym of the course.
   * @example 'LEIC'
   */
  @Column()
  acronym: string;

  /**
   * The faculties associated with the course.
   * @example [{ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Faculty of Engineering', acronym: 'FEUP' }]
   */
  @ManyToMany(
    () => Faculty,
    (faculty) => faculty.courses,
  )
  faculties: Faculty[];

  /**
   * Events associated with this course.
   */
  @ManyToMany(
    () => Event,
    (event) => event.courses,
  )
  events: Event[];
}
