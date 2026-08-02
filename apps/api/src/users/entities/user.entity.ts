import { Exclude } from "class-transformer";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Request } from "@/requests/entities/request.entity";

@Entity()
export class User {
  /**
   * The unique identifier of the user.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The user name.
   * @example 'Cristiano Ronaldo dos Santos Aveiro'
   */
  @Column()
  name: string;

  /**
   * The user e-mail.
   * @example 'cr7@gmail.com'
   */
  @Column({ unique: true })
  email: string;

  /**
   * The user password.
   * @example 'Password#123'
   */
  @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(
    () => Request,
    (request) => request.requestedBy,
  )
  requests: Request[];

  /**
   * Associations the user has access to.
   */
  @ManyToMany(
    () => Association,
    (association) => association.users,
  )
  associations: Association[];

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }
}
