import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAssociationDto {
  /**
   * The name of the association.
   * @example 'Chess Club'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The acronym of the association.
   * @example 'CC'
   */
  @IsOptional()
  @IsString()
  acronym: string;
}
