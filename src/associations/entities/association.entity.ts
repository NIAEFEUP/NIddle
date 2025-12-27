import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Faculty } from '../../faculties/faculty.entity';

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
  @ManyToOne(() => Faculty, (faculty) => faculty.associations, {
    onDelete: 'CASCADE',
  })
  faculty: Faculty;
}
