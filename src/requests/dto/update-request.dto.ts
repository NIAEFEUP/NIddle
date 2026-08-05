import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { UpdateEventDto } from "@/events/dto/update-event.dto";
import { RequestType } from "@/requests/entities/request.entity";
import { UpdateServiceDto } from "@/services/dto/update-service.dto";

export class UpdateRequestDto {
  /**
         * The payload for the request, which can be either a UpdateServiceDto or a UpdateEventDto depending on the type of the request.
         * @example {
  "name": "FEUP Week",
  "description": "FEUP week is a period of interruption of classes and teaching mobility. It includes teaching activities (visits, exhibitions, lectures, ...), as well as the FEUP Project Congress.",
  "year": 2025,
  "startDate": "2025-12-26T09:00:00Z",
  "endDate": "2025-12-27T18:00:00Z",
  "facultyId": 1,
  "courseIds": [
    1
  ]
}
         */
  @ValidateNested()
  @Type(() => UpdateEventDto)
  eventPayload?: UpdateEventDto;

  /**
         * The payload for the request, which can be either a UpdateServiceDto or a UpdateEventDto depending on the type of the request.
         * @example {
  "name": "Papelaria D. Beatriz",
  "email": "PdB@gmail.com",
  "location": "B-142",
  "schedule": [],
  "phoneNumber": "+315 999999999",
  "facultyId": 1,
  "courseId": 1
}
         */
  @ValidateNested()
  @Type(() => UpdateServiceDto)
  servicePayload?: UpdateServiceDto;
}
