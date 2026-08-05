import { IsNotEmpty, IsString } from "class-validator";

export class RejectRequestDto {
    @IsString()
    @IsNotEmpty()
    rejectionReason: string;
}