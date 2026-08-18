import { Type } from "class-transformer";
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { CreateEventDto } from "@/events/dto/create-event.dto";
import { RequestType } from "@/requests/entities/request.entity";
import { CreateServiceDto } from "@/services/dto/create-service.dto";

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
   * The payload for the request, which can be either a CreateServiceDto or a CreateEventDto depending on the type of the request.
   */
  @ValidateIf((dto) => dto.type === RequestType.EVENT)
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateEventDto)
  eventPayload?: CreateEventDto;

  /**
   * The payload for the request, which can be either a CreateServiceDto or a CreateEventDto depending on the type of the request.
   */
  @ValidateIf((dto) => dto.type === RequestType.SERVICE)
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateServiceDto)
  servicePayload?: CreateServiceDto;
}
