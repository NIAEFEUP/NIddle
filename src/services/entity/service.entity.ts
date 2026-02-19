import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { TimeInterval } from "./timeInterval.entity";

@Entity()
export class Service {
  /**
   * The unique identifier of the service.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The service name.
   * @example 'Papelaria D. Beatriz'
   */
  @Column()
  name: string;

  /**
   * The service e-mail.
   * @example 'PdB@gmail.com'
   */
  @Column({ nullable: true })
  email?: string;

  /**
   * The service location.
   * @example 'B-142'
   */

  @Column()
  location: string;

  /**
   * The service's phone number.
   * @example '+315 999999999'
   */
  @Column({ nullable: true })
  phoneNumber?: string;

  @OneToMany(
    () => TimeInterval,
    (timeInterval) => timeInterval.service,
    {
      cascade: true,
    },
  )
  schedule: TimeInterval[];

  @ManyToOne(() => Faculty, { cascade: true })
  @JoinColumn()
  faculty: Faculty;

  @ManyToOne(() => Course, { cascade: true })
  @JoinColumn()
  course: Course;
}
