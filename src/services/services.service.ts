import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Course } from "@/courses/entities/course.entity";
import { CreateServiceDto } from "./dto/create-service.dto";
import { ServiceFilterDto } from "./dto/service-filter.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./entity/service.entity";

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) { }
  create(createServiceDto: CreateServiceDto): Promise<Service> {
    return this.serviceRepository.manager.transaction(async (manager) => {
      const serviceRepo = manager.getRepository(Service);
      const { courseIds, ...serviceData } = createServiceDto;
      const service = serviceRepo.create(serviceData);

      if (courseIds && courseIds.length > 0) {
        const courseRepo = manager.getRepository(Course);
        service.courses = await courseRepo.find({
          where: {
            id: In(courseIds),
          },
        });
      }

      return serviceRepo.save(service);
    });
  }

  findAll(filters: ServiceFilterDto): Promise<Service[]> {
    const { facultyId, courseId } = filters;

    return this.serviceRepository.find({
      where: {
        ...(facultyId && { faculty: { id: facultyId } }),
        ...(courseId && { courses: { id: courseId } }),
      },
      relations: ["faculty", "courses"],
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ["faculty", "courses"],
    });
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return service;
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.serviceRepository.manager.transaction(async (manager) => {
      const serviceRepo = manager.getRepository(Service);
      const service = await serviceRepo.findOne({
        where: { id },
        relations: ["faculty", "courses"],
      });
      if (!service) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }

      const { courseIds, ...serviceData } = updateServiceDto;

      serviceRepo.merge(service, serviceData);

      if (courseIds !== undefined) {
        const courseRepo = manager.getRepository(Course);
        service.courses =
          courseIds.length > 0
            ? await courseRepo.find({
              where: {
                id: In(courseIds),
              },
            })
            : [];
      }

      await serviceRepo.save(service);

      const updatedService = await serviceRepo.findOne({
        where: { id },
        relations: ["faculty", "courses"],
      });
      if (!updatedService) {
        throw new NotFoundException(
          `Service with id ${id} not found after update`,
        );
      }
      return updatedService;
    });
  }

  remove(id: number): Promise<Service> {
    return this.serviceRepository.manager.transaction(async (manager) => {
      const serviceRepo = manager.getRepository(Service);
      const service = await serviceRepo.findOne({
        where: { id },
        relations: { schedule: true } as any,
      });
      if (!service) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }
      await serviceRepo.delete(id);
      return service;
    });
  }
}
