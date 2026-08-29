import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "@/events/entities/event.entity";
import { Request } from "@/requests/entities/request.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";

@Entity()
export class Association {
  /**
   * The unique identifier (UUID) of the association.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /**
   * The name of the association.
   * @example 'Chess Club'
   */
  @Column()
  name: string;

  /**
   * The acronym of the association.
   * @example 'CC'
   */
  @Column({ nullable: true })
  acronym?: string;

  /**
   * Users that belong to the association.
   */
  @ManyToMany(
    () => User,
    (user) => user.associations,
    { cascade: true, onDelete: "CASCADE" },
  )
  @JoinTable()
  users: User[];

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

  @OneToMany(
    () => Request,
    (request) => request.targetAssociation,
  )
  requests: Request[];
}
