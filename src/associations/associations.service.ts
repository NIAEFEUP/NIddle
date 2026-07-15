import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/users/entities/user.entity";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { Association } from "./entities/association.entity";

@Injectable()
export class AssociationsService {
  constructor(
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createAssociationDto: CreateAssociationDto,
  ): Promise<Association> {
    const { userId, ...associationData } = createAssociationDto;

    const association = this.associationRepository.create(associationData);

    association.user = await this.userRepository.findOneByOrFail({
      id: userId,
    });

    return this.associationRepository.save(association);
  }

  findAll(): Promise<Association[]> {
    return this.associationRepository.find({
      relations: ["user"],
    });
  }

  findOne(id: number): Promise<Association> {
    return this.associationRepository.findOneOrFail({
      where: { id },
      relations: ["user"],
    });
  }

  async update(
    id: number,
    updateAssociationDto: UpdateAssociationDto,
  ): Promise<Association> {
    const { userId, ...associationData } = updateAssociationDto;

    const association = await this.associationRepository.findOneOrFail({
      where: { id },
      relations: ["user"],
    });

    this.associationRepository.merge(association, associationData);

    if (userId !== undefined) {
      association.user = await this.userRepository.findOneByOrFail({
        id: userId,
      });
    }

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
