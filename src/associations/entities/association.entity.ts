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

  @ManyToOne(() => Faculty, {
    onDelete: "CASCADE",
  })
  faculty: Faculty;
}
