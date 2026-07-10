import {Injectable, InternalServerErrorException, Logger, OnApplicationBootstrap} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import {validateAndGetRelations} from "@/common/utils/entity-relation.utils";
import {Association} from "@/associations/entities/association.entity";
import {UpdateUserDto} from "@/users/dto/update-user.dto";
import {ConfigService} from "@nestjs/config";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
    private readonly configService: ConfigService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      this.logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping.');
      return;
    }

    const adminExists = await this.userRepository.findOne({
      where: { email: adminEmail },
    })

    if (adminExists) {
      this.logger.log(`Admin user (${adminEmail}) already exists.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin: User = this.userRepository.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
    });

    await this.userRepository.save(admin);
  }

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
