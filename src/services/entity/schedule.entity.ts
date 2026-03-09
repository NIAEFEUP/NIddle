import { Exclude, Type } from "class-transformer";
import {
  IsEnum,
  IsMilitaryTime,
  IsNotEmpty,
  IsString,
} from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Service } from "./service.entity";

export enum EnumDays {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

@Entity()
export class Schedule {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "time" })
  @IsString()
  @IsMilitaryTime()
  @IsNotEmpty()
  startTime: string;

  @Column({ type: "time" })
  @IsString()
  @IsMilitaryTime()
  @IsNotEmpty()
  endTime: string;

  @Column({
    type: "varchar",
    enum: EnumDays,
    default: EnumDays.MONDAY,
  })
  @IsEnum(EnumDays)
  @IsNotEmpty()
  dayOfWeek: EnumDays;

  @ManyToOne(
    () => Service,
    (service) => service.schedule,
  )
  @Type(() => Service)
  service: Service;
}
