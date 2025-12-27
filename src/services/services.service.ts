import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entity/service.entity';
import { Repository } from 'typeorm';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) { }
  create(CreateServiceDto: CreateServiceDto): Promise<Service> {
    return this.serviceRepository.manager.transaction(async (manager) => {
      const serviceRepo = manager.getRepository(Service);
      const service = serviceRepo.create(CreateServiceDto);
      return serviceRepo.save(service);
    });
  }

  findAll(): Promise<Service[]> {
    return this.serviceRepository.find({ relations: ['schedule', 'schedule.timeIntervals'] });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id: id },
      relations: ['schedule', 'schedule.timeIntervals'],
    });
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return service;
  }

  update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service> {
    return this.serviceRepository.manager.transaction(async (manager) => {
      const serviceRepo = manager.getRepository(Service);
      const service = await serviceRepo.findOneBy({ id });
      if (!service) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }
      await serviceRepo.update(id, updateServiceDto);
      const updatedService = await serviceRepo.findOneBy({ id });
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
      const service = await serviceRepo.findOneBy({ id });
      if (!service) {
        throw new NotFoundException(`Service with id ${id} not found`);
      }
      await serviceRepo.delete(id);
      return service;
    })
  }
}
