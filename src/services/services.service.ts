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

    const service = this.serviceRepository.create(serviceData);

    if (facultyId && courseId) {
      throw new BadRequestException(
        "A service cannot be associated with both a faculty and a course.",
      );
    }

    if (!facultyId && !courseId) {
      throw new BadRequestException(
        "A service must be associated with either a faculty or a course.",
      );
    }

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

    return await this.serviceRepository.save(service);
  }

  findAll(filters: ServiceFilterDto): Promise<Service[]> {
    const { facultyId, courseId } = filters;

    return this.serviceRepository.find({
      where: {
        ...(facultyId && { faculty: { id: facultyId } }),
        ...(courseId && { course: { id: courseId } }),
      },
      relations: ["schedule", "faculty", "course"],
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOneOrFail({
      where: { id },
      relations: ["schedule", "faculty", "course"],
    });
    return service;
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const { facultyId, courseId, ...serviceData } = updateServiceDto;

    const service = await this.serviceRepository.findOneOrFail({
      where: { id },
      relations: ["faculty", "course"],
    });

    this.serviceRepository.merge(service, serviceData);

    if (facultyId && courseId) {
      throw new BadRequestException(
        "A service cannot be associated with both a faculty and a course.",
      );
    }

    if (facultyId !== undefined) {
      if (facultyId === null) {
        service.faculty = null;
      } else {
        service.faculty = await this.facultyRepository.findOneByOrFail({
          id: facultyId,
        });
        service.course = null;
      }
    }

    if (courseId !== undefined) {
      if (courseId === null) {
        service.course = null;
      } else {
        service.course = await this.courseRepository.findOneByOrFail({
          id: courseId,
        });
        service.faculty = null;
      }
    }

    return await this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOneByOrFail({ id });
    await this.serviceRepository.delete(id);
    return service;
  }
}
