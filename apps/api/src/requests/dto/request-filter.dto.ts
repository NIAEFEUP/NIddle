import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";
import {
  RequestAction,
  RequestStatus,
  RequestType,
} from "@/requests/entities/request.entity";

export class RequestFilterDto {
  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @IsOptional()
  @IsEnum(RequestAction)
  action?: RequestAction;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  requestedBy?: number;
}
