import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { UpdateEventDto } from "@/events/dto/update-event.dto";
import { UpdateServiceDto } from "@/services/dto/update-service.dto";

export class UpdateRequestDto {
  /**
   * The payload for the request, which can be either a UpdateServiceDto or a UpdateEventDto depending on the type of the request.
   */
  @ValidateNested()
  @Type(() => UpdateEventDto)
  eventPayload?: UpdateEventDto;

  /**
   * The payload for the request, which can be either a UpdateServiceDto or a UpdateEventDto depending on the type of the request.
   */
  @ValidateNested()
  @Type(() => UpdateServiceDto)
  servicePayload?: UpdateServiceDto;
}
