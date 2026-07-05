import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateAssociationDto {
  /**
   * The name of the association.
   * @example 'Chess Club'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The user ID (owner) of the association.
   * @example 5
   */
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
