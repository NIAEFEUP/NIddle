import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { RequestType } from "@/requests/entities/request.entity";

export class CreateRequestDto {
  /**
   * The type of the request, either "Service" or "Event".
   * @example 'Service'
   */
  @IsEnum(RequestType)
  @IsNotEmpty()
  type: RequestType;

  @IsOptional()
  @IsInt()
  targetId?: number;

  /**
   * The payload for the request. Its shape depends on `type`: a CreateEventDto for
   * "Event" requests, a CreateServiceDto for "Service" requests.
   */
  @IsDefined()
  payload: Record<string, unknown>;
}
