import { BadRequestException, Injectable } from "@nestjs/common";
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

    if (facultyId !== undefined && courseId !== undefined) {
      throw new BadRequestException(
        "Exactly one of [facultyId, courseId] must be provided, not both and not neither.",
      );
    }

    if (facultyId === undefined && courseId === undefined) {
      throw new BadRequestException(
        "Exactly one of [facultyId, courseId] must be provided, not both and not neither.",
      );
    }

    const service = this.serviceRepository.create(serviceData);

    if (facultyId) {
      service.faculty = await this.facultyRepository.findOneByOrFail({
        id: facultyId,
      });
    }

    if (courseId) {
      service.course = await this.courseRepository.findOneByOrFail({
        id: courseId,
      });
    }

    service.validateFacultyAndCourses();

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
      service.faculty = await this.facultyRepository.findOneByOrFail({
        id: facultyId,
      });
      service.course = null;
    }

    if (courseId !== undefined) {
      service.course = await this.courseRepository.findOneByOrFail({
        id: courseId,
      });
      service.faculty = null;
    }

    return this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOneByOrFail({ id });
    await this.serviceRepository.delete(id);
    return service;
  }
}
