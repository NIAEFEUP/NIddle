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
    const faculty = this.facultyRepository.create(createFacultyDto);
    return this.facultyRepository.save(faculty);
  }

  findAll(): Promise<Faculty[]> {
    return this.facultyRepository.find();
  }

  findOne(id: number): Promise<Faculty> {
    return this.facultyRepository.findOneByOrFail({ id });
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    const result = await this.facultyRepository.update(id, updateFacultyDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Faculty with id ${id} not found`);
    }
    return this.facultyRepository.findOneByOrFail({ id });
  }

  async remove(id: number): Promise<Faculty> {
    const faculty = this.facultyRepository.findOneByOrFail({ id });
    await this.facultyRepository.delete(id);
    return faculty;
  }
}
