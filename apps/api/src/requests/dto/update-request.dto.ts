import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { IsDefined } from "class-validator";
import { UpdateEventDto } from "@/events/dto/update-event.dto";
import { UpdateServiceDto } from "@/services/dto/update-service.dto";

@ApiExtraModels(UpdateEventDto, UpdateServiceDto)
export class UpdateRequestDto {
  /**
   * The payload for the request. Its shape depends on the request's existing type:
   * an UpdateEventDto for "Event" requests, an UpdateServiceDto for "Service" requests.
   */
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(UpdateEventDto) },
      { $ref: getSchemaPath(UpdateServiceDto) },
    ],
    additionalProperties: false,
  })
  @IsDefined()
  payload: Record<string, unknown>;
}
