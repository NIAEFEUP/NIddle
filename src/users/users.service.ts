import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import {validateAndGetRelations} from "@/common/utils/entity-relation.utils";
import {Association} from "@/associations/entities/association.entity";
import {UpdateUserDto} from "@/users/dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { associationIds, ...userData } = createUserDto;
    const user = this.userRepository.create(userData);

    if (associationIds !== undefined) {
      user.associations = await validateAndGetRelations(
          this.associationRepository,
          associationIds,
          "associations",
      )
    }

    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneByOrFail({ email: email });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { associationIds, ...userData } = updateUserDto;

    const user = await this.userRepository.findOneOrFail({ where: { id } });

    this.userRepository.merge(user, userData);

    if (associationIds !== undefined) {
      user.associations = await validateAndGetRelations(
          this.associationRepository,
          associationIds,
          "associations",
      );
    }

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.userRepository.findOneOrFail({ where: { id } });
    await this.userRepository.delete(id);
    return user;
  }
}
