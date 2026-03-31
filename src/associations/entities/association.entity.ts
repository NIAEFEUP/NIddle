import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";

@Entity()
export class Association {
  /**
   * The unique identifier of the association.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The name of the association.
   * @example 'Chess Club'
   */
  @Column()
  name: string;

  /**
   * The user (owner) of the association.
   */
  @OneToOne(() => User, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  /**
   * The course associated with this association (optional).
   */
  @OneToOne(
    () => Course,
    (course) => course.association,
    { nullable: true },
  )
  @JoinColumn()
  course?: Course | null;

  /**
   * The events organized by this association.
   */
  @OneToMany(
    () => Event,
    (event) => event.association,
  )
  events: Event[];

  /**
   * The services owned by this association.
   */
  @OneToMany(
    () => Service,
    (service) => service.ownedAssociation,
  )
  ownerServices: Service[];

  /**
   * The services managed by this association.
   */
  @OneToMany(
    () => Service,
    (service) => service.managedAssociation,
  )
  managerServices: Service[];

  /**
   * The faculty this association belongs to.
   */
  @ManyToOne(() => Faculty, {
    onDelete: "CASCADE",
  })
  faculty: Faculty;
}
