import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { Association } from "@/associations/entities/association.entity";
import { PaginatedResponseDto, paginate } from "@/common/pagination";
import { buildOrderClause } from "@/common/sorting";
import { validateAndGetRelations } from "@/common/utils/entity-relation.utils";
import { UpdateUserDto } from "@/users/dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserFilterDto } from "./dto/user-filter.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const adminEmail = this.configService.get<string>("ADMIN_EMAIL");
    const adminPassword = this.configService.get<string>("ADMIN_PASSWORD");

    if (!adminEmail || !adminPassword) {
      this.logger.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping.");
      return;
    }

    const adminExists = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

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
    const { password, associationIds, ...userData } = createUserDto;
    const user = this.userRepository.create(userData);

    user.password = await bcrypt.hash(password, 10);

    if (associationIds !== undefined && associationIds !== null) {
      user.associations = await validateAndGetRelations(
        this.associationRepository,
        associationIds,
        "associations",
      );
    }

    return this.userRepository.save(user);
  }

  async findAll(filters: UserFilterDto): Promise<PaginatedResponseDto<User>> {
    const { isAdmin, associationId } = filters;

    return paginate(this.userRepository, filters, {
      where: {
        ...(isAdmin !== undefined && { isAdmin }),
        ...(associationId && { associations: { id: associationId } }),
      },
      order: buildOrderClause(filters),
    });
  }

  findOne(id: string): Promise<User> {
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  async findOneWithAssociations(id: string): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { id },
      relations: ["associations"],
    });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneByOrFail({ email: email });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { password, associationIds, ...userData } = updateUserDto;

    const user = await this.userRepository.findOneOrFail({ where: { id } });

    this.userRepository.merge(user, userData);

    if (password !== undefined) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (associationIds !== undefined && associationIds !== null) {
      user.associations = await validateAndGetRelations(
        this.associationRepository,
        associationIds,
        "associations",
      );
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<User> {
    const user = await this.userRepository.findOneOrFail({ where: { id } });
    await this.userRepository.delete(id);
    return user;
  }
}
