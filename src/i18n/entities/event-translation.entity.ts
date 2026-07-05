import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "@/events/entities/event.entity";

@Entity()
export class EventTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "event_id" })
  eventId: number;

  /**
   * The language code for this translation.
   * @example "en"
   */
  @Column({ name: "language_code", length: 10 })
  languageCode: string;

  /**
   * The event name in this language.
   * @example "FEUP Week"
   */
  @Column()
  name: string;

  /**
   * The event description in this language.
   * @example "FEUP week is a period of interruption of classes and teaching mobility."
   */
  @Column({ type: "text", nullable: true })
  description: string | null;

  @ManyToOne(
    () => Event,
    (event) => event.translations,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "event_id" })
  event: Event;
}
