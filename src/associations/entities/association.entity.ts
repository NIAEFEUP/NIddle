import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Faculty } from '../../faculties/entities/faculty.entity';

@Entity()
export class Association {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Feature #46: An Association is a type of User (has login credentials)
  @OneToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // Feature #46: An Association belongs to a Faculty
  @ManyToOne(() => Faculty, {
    onDelete: 'CASCADE',
  })
  faculty: Faculty;
}
