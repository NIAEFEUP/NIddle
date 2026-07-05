import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "@/events/entities/event.entity";
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
   * The events organized by this association.
   */
  @OneToMany(
    () => Event,
    (event) => event.createdBy,
  )
  events: Event[];

  /**
   * The services created by this association.
   */
  @OneToMany(
    () => Service,
    (service) => service.createdBy,
  )
  services: Service[];
}
