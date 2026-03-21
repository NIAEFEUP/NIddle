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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Feature #46: An Association is a type of User (has login credentials)
  @OneToOne(() => User, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @OneToOne(
    () => Course,
    (course) => course.association,
    { nullable: true },
  )
  @JoinColumn()
  course?: Course | null;

  @OneToMany(
    () => Event,
    (event) => event.association,
  )
  events: Event[];

  @OneToMany(
    () => Service,
    (service) => service.ownedAssociation,
  )
  ownerServices: Service[];

  @OneToMany(
    () => Service,
    (service) => service.managedAssociation,
  )
  managerServices: Service[];

  // Feature #46: An Association belongs to a Faculty
  @ManyToOne(() => Faculty, {
    onDelete: "CASCADE",
  })
  faculty: Faculty;
}
