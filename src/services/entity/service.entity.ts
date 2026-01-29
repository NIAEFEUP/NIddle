import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Schedule } from './schedule.entity';
import { Faculty } from '../../faculties/faculty.entity';
import { Optional } from '@nestjs/common';

@Entity()
export class Service {
  /**
   * The unique identifier of the service.
   * @example 1
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The service name.
   * @example 'Papelaria D. Beatriz'
   */
  @Column()
  name: string;

  /**
   * The service e-mail.
   * @example 'PdB@gmail.com'
   */
  @Column({nullable: true})
  email?: string;

  /**
   * The service location.
   * @example 'B-142'
   */

  @Column()
  location: string;

  /**
   * The service's phone number.
   * @example '+315 999999999'
   */
  @Column({nullable: true})
  phoneNumber?: string;

  @OneToOne(() => Schedule, { cascade: true })
  @JoinColumn()
  schedule: Schedule;

  @ManyToOne(() => Faculty, (service) => service.id)
  @JoinColumn()
  faculty: Faculty;
}
