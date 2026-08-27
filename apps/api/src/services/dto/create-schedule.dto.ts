import { IsEnum, IsMilitaryTime, IsNotEmpty, IsString } from "class-validator";
import { EnumDays } from "@/services/entity/schedule.entity";

export class CreateScheduleDto {
  /**
   * The start time of the schedule slot, in 24h format.
   * @example '09:00'
   */
  @IsString()
  @IsMilitaryTime()
  @IsNotEmpty()
  startTime: string;

  /**
   * The end time of the schedule slot, in 24h format.
   * @example '17:00'
   */
  @IsString()
  @IsMilitaryTime()
  @IsNotEmpty()
  endTime: string;

  /**
   * The day of the week this schedule slot applies to.
   * @example 'Monday'
   */
  @IsEnum(EnumDays)
  @IsNotEmpty()
  dayOfWeek: EnumDays;
}
