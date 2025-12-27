import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    acronym: string;

    /**
     * The IDs of the faculties associated with the course.
     * @example [1, 2]
     */
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    facultyIds?: number[];
}
