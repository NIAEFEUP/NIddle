import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./entity/service.entity";

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}
  create(createServiceDto: CreateServiceDto): Promise<Service> {
    return this.serviceRepository.manager.transaction(async (manager) => {
      const serviceRepo = manager.getRepository(Service);
      const service = serviceRepo.create(createServiceDto);
      return serviceRepo.save(service);
    });
  }

  findAll(): Promise<Service[]> {
    // use nested relations object to avoid relation-path resolution issues
    return this.serviceRepository.find({
      // cast to any to satisfy TypeScript relation typing in tests/runtime
      relations: {
        schedule: true,
      } as any,
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id: id },
      relations: { schedule: true } as any,
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
        relations: { schedule: true } as any,
      });
      if (!service) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }
      await serviceRepo.update(id, updateServiceDto);
      const updatedService = await serviceRepo.findOne({
        where: { id },
        relations: { schedule: true } as any,
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
