import { PartialType } from '@nestjs/swagger';
import { CreateAssociationDto } from './create-association.dto';

export class UpdateAssociationDto extends PartialType(CreateAssociationDto) {}
