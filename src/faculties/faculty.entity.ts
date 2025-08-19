import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Faculty {
  /**
   * The unique identifier of the faculty.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The name of the faculty.
   * @example 'Faculty of Engineering'
   */
  @Column()
  name: string;

  /**
   * The acronym of the faculty.
   * @example 'FEUP'
   */
  @Column()
  acronym: string;
}
