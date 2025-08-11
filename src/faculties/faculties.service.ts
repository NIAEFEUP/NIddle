import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty } from './faculty.entity';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
  ) {}
  create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    return this.facultyRepository.manager.transaction(async (manager) => {
      const facultyRepo = manager.getRepository(Faculty);
      const faculty = new Faculty();
      faculty.acronym = createFacultyDto.acronym;
      faculty.name = createFacultyDto.name;
      return facultyRepo.save(faculty);
    });
  }

  findAll(): Promise<Faculty[]> {
    return this.facultyRepository.find();
  }

  async findOne(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOneBy({ id: id });
    if (!faculty) {
      throw new NotFoundException(`Faculty with id ${id} not found`);
    }
    return faculty;
  }

  update(id: number, updateFacultyDto: UpdateFacultyDto): Promise<Faculty> {
    return this.facultyRepository.manager.transaction(async (manager) => {
      const facultyRepo = manager.getRepository(Faculty);
      const faculty = await facultyRepo.findOneBy({ id });
      if (!faculty) {
        throw new NotFoundException(`Faculty with id ${id} not found`);
      }
      await facultyRepo.update(id, updateFacultyDto);
      const updatedFaculty = await facultyRepo.findOneBy({ id });
      if (!updatedFaculty) {
        throw new NotFoundException(
          `Faculty with id ${id} not found after update`,
        );
      }
      return updatedFaculty;
    });
  }

  remove(id: number): Promise<Faculty> {
    return this.facultyRepository.manager.transaction(async (manager) => {
      const facultyRepo = manager.getRepository(Faculty);
      const faculty = await facultyRepo.findOneBy({ id });
      if (!faculty) {
        throw new NotFoundException(`Faculty with id ${id} not found`);
      }
      await facultyRepo.delete(id);
      return faculty;
    });
  }
}
