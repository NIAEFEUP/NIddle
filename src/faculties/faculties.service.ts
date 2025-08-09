import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
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
    const faculty = new Faculty();

    faculty.acronym = createFacultyDto.acronym;
    faculty.name = createFacultyDto.name;

    return this.facultyRepository.save(faculty);
  }

  findAll(): Promise<Faculty[]> {
    return this.facultyRepository.find();
  }

  findOne(id: number): Promise<Faculty | null> {
    return this.facultyRepository.findOneBy({ id: id });
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    await this.facultyRepository.update(id, updateFacultyDto);
    const updatedFaculty = await this.facultyRepository.findOneBy({ id });
    if (!updatedFaculty) {
      throw new NotFoundException(`Faculty with id ${id} not found`);
    }
    return updatedFaculty;
  }

  remove(id: number): Promise<DeleteResult> {
    return this.facultyRepository.delete(id);
  }
}
