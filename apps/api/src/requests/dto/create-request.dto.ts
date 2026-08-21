import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { CreateEventDto } from "@/events/dto/create-event.dto";
import { RequestType } from "@/requests/entities/request.entity";
import { CreateServiceDto } from "@/services/dto/create-service.dto";

@ApiExtraModels(CreateEventDto, CreateServiceDto)
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
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateEventDto) },
      { $ref: getSchemaPath(CreateServiceDto) },
    ],
    additionalProperties: false,
  })
  @IsDefined()
  payload: Record<string, unknown>;
}
