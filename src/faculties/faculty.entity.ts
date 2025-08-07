import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Faculty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  acronym: string;

  @Column()
  name: string;
}
