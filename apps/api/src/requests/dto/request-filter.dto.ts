import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { createSortDto } from "@/common/sorting";
import {
  RequestAction,
  RequestStatus,
  RequestType,
} from "@/requests/entities/request.entity";

export const REQUEST_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "reviewedAt",
] as const;

export class RequestFilterDto extends createSortDto(REQUEST_SORT_FIELDS) {
  /**
   * Filter by request type
   * @example 'Event'
   */
  @ApiPropertyOptional({
    enum: RequestType,
    description: "Filter by request type",
  })
  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  /**
   * Filter by request action
   * @example 'Create'
   */
  @ApiPropertyOptional({
    enum: RequestAction,
    description: "Filter by request action",
  })
  @IsOptional()
  @IsEnum(RequestAction)
  action?: RequestAction;

  /**
   * Filter by request status
   * @example 'Pending'
   */
  @ApiPropertyOptional({
    enum: RequestStatus,
    description: "Filter by request status",
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  /**
   * The UUID of the user who requested the action.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The UUID of the user who requested the action",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  requestedBy?: string;

  /**
   * The UUID of the target association.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiPropertyOptional({
    description: "The UUID of the target association",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  targetAssociationId?: string;
}
