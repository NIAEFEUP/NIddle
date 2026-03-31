import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { Association } from "./entities/association.entity";

@Injectable()
export class AssociationsService {
  constructor(
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
  ) {}

  create(createAssociationDto: CreateAssociationDto): Promise<Association> {
    const association = this.associationRepository.create(
      createAssociationDto as Partial<Association>,
    );
    return this.associationRepository.save(association);
  }

  findAll(facultyId?: number) {
    if (facultyId) {
      return this.associationRepository.find({
        where: { faculty: { id: facultyId } },
        relations: ["faculty", "user"],
      });
    }
    return this.associationRepository.find({
      relations: ["faculty", "user"],
    });
  }

  findOne(id: number) {
    return this.associationRepository.findOne({
      where: { id },
      relations: ["faculty", "user"],
    });
  }

  update(id: number, updateAssociationDto: UpdateAssociationDto) {
    return this.associationRepository.update(id, updateAssociationDto);
  }

  remove(id: number) {
    return this.associationRepository.delete(id);
  }
}
