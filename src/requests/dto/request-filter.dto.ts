import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";
import { RequestStatus, RequestType } from "../entities/request.entity";

export class RequestFilterDto {
  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  requestedBy?: number;
}
