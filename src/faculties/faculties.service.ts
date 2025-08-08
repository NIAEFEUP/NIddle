import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, UpdateResult, Repository } from 'typeorm';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty } from './faculty.entity';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
  ) {}

  private faculties: Faculty[] = [
    { id: 1, name: 'Faculty of Architecture', acronym: 'FAUP' },
    { id: 2, name: 'Faculty of Fine Arts', acronym: 'FBAUP' },
    { id: 3, name: 'Faculty of Sciences', acronym: 'FCUP' },
    { id: 4, name: 'Faculty of Nutrition and Food Science', acronym: 'FCNAUP' },
    { id: 5, name: 'Faculty of Sport', acronym: 'FADEUP' },
    { id: 6, name: 'Faculty of Law', acronym: 'FDUP' },
    { id: 7, name: 'Faculty of Economics', acronym: 'FEP' },
    { id: 8, name: 'Faculty of Engineering', acronym: 'FEUP' },
    { id: 9, name: 'Faculty of Pharmacy', acronym: 'FFUP' },
    { id: 10, name: 'Faculty of Arts and Humanities', acronym: 'FLUP' },
    { id: 11, name: 'Faculty of Medicine', acronym: 'FMUP' },
    { id: 12, name: 'Faculty of Dental Medicine', acronym: 'FMDUP' },
    {
      id: 13,
      name: 'Faculty of Psychology and Education Science',
      acronym: 'FPCEUP',
    },
    {
      id: 14,
      name: 'Institute of Biomedical Sciences Abel Salazar',
      acronym: 'ICBAS',
    },
    { id: 15, name: 'Nursing School of Porto', acronym: 'ESEP' },
  ];

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

  async update(id: number, updateFacultyDto: UpdateFacultyDto): Promise<Faculty> {
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
