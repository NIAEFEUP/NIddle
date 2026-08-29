import { IsEnum, IsOptional, IsUUID } from "class-validator";
import {
  RequestAction,
  RequestStatus,
  RequestType,
} from "@/requests/entities/request.entity";
import { PaginationDto } from "@/common/dto/pagination.dto";

export class RequestFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @IsOptional()
  @IsEnum(RequestAction)
  action?: RequestAction;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  /**
   * The UUID of the user who requested the action.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @IsOptional()
  @IsUUID()
  requestedBy?: string;
}
