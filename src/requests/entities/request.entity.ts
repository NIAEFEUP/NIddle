import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CreateEventDto } from "@/events/dto/create-event.dto";
import { CreateServiceDto } from "@/services/dto/create-service.dto";
import { User } from "@/users/entities/user.entity";

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
  )
  requestedBy: User;

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
}
