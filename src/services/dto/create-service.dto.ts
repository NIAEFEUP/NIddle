import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Schedule } from '../entity/schedule.entity';

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
  @IsEmail(undefined, { message: 'Invalid email format' })
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
   * TODO : make example
   */
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Schedule)
  schedule: Schedule;

  /**
   * The service's phone number.
   * @example '+315 999999999'
   */
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
