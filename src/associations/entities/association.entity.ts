import {
  Column,
  Entity,
  JoinTable, ManyToMany,
  OneToMany,
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
   * The acronym of the association.
   * @example 'CC'
   */
  @Column({ nullable: true })
  acronym?: string;

  /**
   * Users that belong to the association.
   */
  @ManyToMany(() => User, { cascade: true, onDelete: "CASCADE" })
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
}
