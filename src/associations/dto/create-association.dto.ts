import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAssociationDto {
  /**
   * The name of the association.
   * @example 'Chess Club'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The faculty ID this association belongs to.
   * @example 1
   */
  @IsInt()
  @IsNotEmpty()
  facultyId: number;

  /**
   * The user ID (owner) of the association.
   * @example 5
   */
  @IsInt()
  @IsNotEmpty()
  userId: number;

  /**
   * The course ID associated with this association (optional, can be null to clear).
   * @example 3
   */
  @IsInt()
  @IsOptional()
  courseId?: number;
}
