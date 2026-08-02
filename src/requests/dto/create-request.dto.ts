import { IsEnum, IsNotEmpty, ValidateIf, ValidateNested } from "class-validator";
import { RequestType } from "../entities/request.entity";
import { CreateServiceDto } from "@/services/dto/create-service.dto";
import { CreateEventDto } from "@/events/dto/create-event.dto";
import { Type } from "class-transformer";

export class CreateRequestDto {
    @IsEnum(RequestType)
    @IsNotEmpty()
    type: RequestType;

    @ValidateIf((dto) => dto.type === RequestType.EVENT)
    @ValidateNested()
    @Type(() => CreateEventDto)
    eventPayload?: CreateEventDto;

    @ValidateIf((dto) => dto.type === RequestType.SERVICE)
    @ValidateNested()
    @Type(() => CreateServiceDto)
    servicePayload?: CreateServiceDto;
}