import { IsDefined } from "class-validator";

export class UpdateRequestDto {
  /**
   * The payload for the request. Its shape depends on the request's existing type:
   * an UpdateEventDto for "Event" requests, an UpdateServiceDto for "Service" requests.
   */
  @IsDefined()
  payload: Record<string, unknown>;
}
