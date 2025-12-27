import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Association } from '../associations/entities/association.entity';

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

  /**
   * The associations belonging to this faculty.
   */
  @OneToMany(() => Association, (association) => association.faculty)
  associations: Association[];
}