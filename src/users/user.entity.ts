import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
  @Column()
  email: string;

  /**
   * The user password.
   * @example 'Password123!'
   */
  @Exclude()
  @Column()
  password: string;

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }
}
