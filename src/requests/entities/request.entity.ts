import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CreateEventDto } from "@/events/dto/create-event.dto";
import { Event } from "@/events/entities/event.entity";
import { CreateServiceDto } from "@/services/dto/create-service.dto";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { Association } from "@/associations/entities/association.entity";

export enum RequestStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export enum RequestType {
  SERVICE = "Service",
  EVENT = "Event",
}

@Entity()
export class Request {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: RequestType,
  })
  type: RequestType;

  @Column({
    type: "enum",
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @ManyToOne(
    () => User,
    (user) => user.requests,
    { nullable: true, onDelete: "SET NULL" },
  )
  requestedBy: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: Date,
    nullable: true,
  })
  reviewedAt: Date | null;

  @Column({
    type: "varchar",
    nullable: true,
  })
  rejectionReason: string | null;

  @Column({
    type: "simple-json",
  })
  payload: CreateServiceDto | CreateEventDto;

  @ManyToOne(() => Event, { nullable: true, onDelete: "CASCADE" })
  targetEvent: Event | null;

  @ManyToOne(() => Service, { nullable: true, onDelete: "CASCADE" })
  targetService: Service | null;

  @ManyToOne(
    () => Association,
    (association) => association.requests,
    { nullable: false, onDelete: "CASCADE" },
  )
  targetAssociation: Association;
}
