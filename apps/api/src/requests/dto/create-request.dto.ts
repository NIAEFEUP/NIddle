import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  ValidateIf,
} from "class-validator";
import { CreateEventDto } from "@/events/dto/create-event.dto";
import { RequestAction, RequestType } from "@/requests/entities/request.entity";
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

  /**
   * The type of action the request is for, either "Create", "Update Existing" or "Delete Existing".
   * @example 'Delete Existing'
   */
  @IsEnum(RequestAction)
  @IsNotEmpty()
  action: RequestAction;

  @ValidateIf((dto) => dto.action !== RequestAction.CREATE)
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
  @ValidateIf((dto) => dto.action !== RequestAction.DELETE_EXISTING)
  @IsDefined()
  payload: Record<string, unknown>;
}
