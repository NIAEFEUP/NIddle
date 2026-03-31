import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { User } from "@/users/entities/user.entity";
import { AssociationFilterDto } from "./dto/association-filter.dto";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { Association } from "./entities/association.entity";

@Injectable()
export class AssociationsService {
  constructor(
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(
    createAssociationDto: CreateAssociationDto,
  ): Promise<Association> {
    const { facultyId, userId, courseId, ...associationData } =
      createAssociationDto;

    const association = this.associationRepository.create(associationData);

    association.faculty = await this.facultyRepository.findOneByOrFail({
      id: facultyId,
    });

    association.user = await this.userRepository.findOneByOrFail({
      id: userId,
    });

    if (courseId !== undefined && courseId !== null) {
      association.course = await this.courseRepository.findOneByOrFail({
        id: courseId,
      });
    }

    return this.associationRepository.save(association);
  }

  findAll(filters: AssociationFilterDto): Promise<Association[]> {
    const { facultyId } = filters;

    return this.associationRepository.find({
      where: {
        ...(facultyId && { faculty: { id: facultyId } }),
      },
      relations: ["faculty", "user"],
    });
  }

  findOne(id: number): Promise<Association> {
    return this.associationRepository.findOneOrFail({
      where: { id },
      relations: ["faculty", "user"],
    });
  }

  async update(
    id: number,
    updateAssociationDto: UpdateAssociationDto,
  ): Promise<Association> {
    const { facultyId, userId, courseId, ...associationData } =
      updateAssociationDto;

    const association = await this.associationRepository.findOneOrFail({
      where: { id },
      relations: ["faculty", "user", "course"],
    });

    this.associationRepository.merge(association, associationData);

    if (facultyId !== undefined) {
      association.faculty = await this.facultyRepository.findOneByOrFail({
        id: facultyId,
      });
    }

    if (userId !== undefined) {
      association.user = await this.userRepository.findOneByOrFail({
        id: userId,
      });
    }

    if (courseId !== undefined) {
      association.course = await this.courseRepository.findOneByOrFail({
        id: courseId,
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
