import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { Association } from "./entities/association.entity";
import { PaginationDto } from "@/common/dto/pagination.dto";

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

  async findAll(pagination: PaginationDto): Promise<Association[]> {
    const { page, limit } = pagination;

    const [items] = await this.associationRepository.findAndCount({
      relations: ["users"],
      skip: (page - 1) * limit,
      take: limit,
    });

    return items;
  }

  findOne(id: string): Promise<Association> {
    return this.associationRepository.findOneOrFail({
      where: { id },
      relations: ["users"],
    });
  }

  async update(
    id: string,
    updateAssociationDto: UpdateAssociationDto,
  ): Promise<Association> {
    const association = await this.associationRepository.findOneOrFail({
      where: { id },
      relations: ["users"],
    });

    this.associationRepository.merge(association, updateAssociationDto);

    return this.associationRepository.save(association);
  }

  async remove(id: string): Promise<Association> {
    const association = await this.associationRepository.findOneByOrFail({
      id,
    });
    await this.associationRepository.delete(id);
    return association;
  }
}
