import { BadRequestException } from "@nestjs/common";
import {
  BeforeInsert,
  BeforeUpdate,
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

  @Column({ nullable: true })
  location?: string;

  /**
   * The service's phone number.
   * @example '+315 999999999'
   */
  @Column({ nullable: true })
  phoneNumber?: string;

  /**
   * The service's schedule.
   * @example []
   */
  @OneToMany(
    () => Schedule,
    (timeInterval) => timeInterval.service,
    {
      cascade: true,
    },
  )
  schedule?: Schedule[];

  @ManyToOne(() => Faculty, { nullable: true })
  @JoinColumn()
  faculty: Faculty | null;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn()
  course: Course | null;

  @BeforeInsert()
  @BeforeUpdate()
  validateFacultyAndCourses(): void {
    const hasFaculty = !!this.faculty;
    const hasCourse = !!this.course;

    if (hasFaculty && hasCourse) {
      throw new BadRequestException(
        "Exactly one of [faculty, course] must be provided, not both.",
      );
    }

    if (!hasFaculty && !hasCourse) {
      throw new BadRequestException(
        "Exactly one of [faculty, course] must be provided, not neither.",
      );
    }
  }
}
