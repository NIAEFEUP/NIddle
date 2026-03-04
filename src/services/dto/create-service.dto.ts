import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ValidateOneOf } from "@/common/decorators/validate-one-of.decorator";
import { Schedule } from "@/services/entity/schedule.entity";

export class CreateServiceDto {
  /**
   * The name of the Service
   * @example 'Papelaria D. Beatriz'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The service e-mail.
   * @example 'PdB@gmail.com'
   */
  @IsString()
  @IsEmail(undefined, { message: "Invalid email format" })
  @IsOptional()
  email?: string;

  /**
   * The service location.
   * @example 'B-142'
   */
  @IsString()
  @IsNotEmpty()
  location: string;

  /**
   * The service's working hours.
   * @example []
   */
  @IsNotEmpty()
  @Type(() => Schedule)
  schedule: Schedule[];

  /**
   * The service's phone number.
   * @example '+315 999999999'
   */
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  /**
   * The faculty ID this service belongs to.
   * @example 1
   */
  @IsOptional()
  @ValidateOneOf(["facultyId", "courseId"])
  facultyId?: number;

  /**
   * The course IDs associated with this service.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  courseId?: number;
}
