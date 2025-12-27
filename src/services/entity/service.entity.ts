import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

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
  @Column()
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
  @Column()
  phoneNumber?: string;

  @OneToOne(() => Schedule, { cascade: true })
  @JoinColumn()
  schedule: Schedule;
}
