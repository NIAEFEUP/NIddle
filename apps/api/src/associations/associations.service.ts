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

  async create(
    createAssociationDto: CreateAssociationDto,
  ): Promise<Association> {
    const association = this.associationRepository.create(createAssociationDto);

    return this.associationRepository.save(association);
  }

  findAll(): Promise<Association[]> {
    return this.associationRepository.find({
      relations: ["users"],
    });
  }

  findOne(id: number): Promise<Association> {
    return this.associationRepository.findOneOrFail({
      where: { id },
      relations: ["users"],
    });
  }

  async update(
    id: number,
    updateAssociationDto: UpdateAssociationDto,
  ): Promise<Association> {
    const association = await this.associationRepository.findOneOrFail({
      where: { id },
      relations: ["users"],
    });

    this.associationRepository.merge(association, updateAssociationDto);

    return this.associationRepository.save(association);
  }

  async remove(id: number): Promise<Association> {
    const association = await this.associationRepository.findOneByOrFail({
      id,
    });
    await this.associationRepository.delete(id);
    return association;
  }
}
