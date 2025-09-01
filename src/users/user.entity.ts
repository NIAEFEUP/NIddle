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
   * @example 'password123'
   */
  @Column()
  password: string;
}
