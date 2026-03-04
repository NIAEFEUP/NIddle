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
import { Schedule } from "./schedule.entity";

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

  /**
   * The service's schedule.
   * @example null
   */
  @OneToMany(
    () => Schedule,
    (timeInterval) => timeInterval.service,
    {
      cascade: true,
    },
  )
  schedule: Schedule[];

  @ManyToOne(() => Faculty, { cascade: true, nullable: true })
  @JoinColumn()
  faculty: Faculty | null;

  @ManyToOne(() => Course, { cascade: true, nullable: true })
  @JoinColumn()
  course: Course | null;

  validateFacultyAndCourses(): void {
    if (this.faculty && this.course) {
      throw new Error(
        "Service cannot have both faculty and courses assigned. Please choose either a faculty or courses, not both.",
      );
    }
  }
}
