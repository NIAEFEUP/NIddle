import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { CreateServiceDto } from "./dto/create-service.dto";
import { ServiceFilterDto } from "./dto/service-filter.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./entity/service.entity";

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}
  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const { facultyId, courseId, ...serviceData } = createServiceDto;
    const service = this.serviceRepository.create(serviceData);

    if (facultyId !== undefined) {
      if (courseId !== undefined) {
        throw new Error(
          "Service cannot have both faculty and courses assigned. Please choose either a faculty or courses, not both.",
        );
      }
      service.faculty = await this.facultyRepository.findOneByOrFail({
        id: facultyId,
      });
    } else if (courseId !== undefined) {
      service.course = await this.courseRepository.findOneByOrFail({
        id: courseId,
      });
    } else {
      throw new Error(
        "Service must have either facultyId or courseId assigned.",
      );
    }
    return this.serviceRepository.save(service);
  }

  findAll(filters: ServiceFilterDto): Promise<Service[]> {
    const { facultyId, courseId } = filters;

    return this.serviceRepository.find({
      where: {
        ...(facultyId && { faculty: { id: facultyId } }),
        ...(courseId && { course: { id: courseId } }),
      },
      relations: ["faculty", "course"],
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOneOrFail({
      where: { id },
      relations: ["faculty", "course"],
    });
    return service;
  }

  async update(
    id: number,
    UpdateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const { facultyId, courseId, ...serviceData } = UpdateServiceDto;
    const service = await this.serviceRepository.findOneByOrFail({ id });
    this.serviceRepository.merge(service, serviceData);
    if (facultyId !== undefined) {
      if (courseId !== undefined) {
        throw Error;
      }
      service.faculty = await this.facultyRepository.findOneByOrFail({
        id: facultyId,
      });
    }
    if (courseId !== undefined) {
      service.course = await this.courseRepository.findOneByOrFail({
        id: courseId,
      });
    }
    return this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOneByOrFail({ id });
    await this.serviceRepository.delete(id);
    return service;
  }
}
