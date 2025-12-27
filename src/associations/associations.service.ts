import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Association } from './entities/association.entity';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';

@Injectable()
export class AssociationsService {
  constructor(
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
  ) {}

  create(createAssociationDto: CreateAssociationDto) {
    //implement the user registration logic later
    return 'This action adds a new association';
  }

  // Feature #50: Filter associations by Faculty ID
  findAll(facultyId?: number) {
    if (facultyId) {
      return this.associationRepository.find({
        where: { faculty: { id: facultyId } },
        relations: ['faculty', 'user'],
      });
    }
    return this.associationRepository.find({
      relations: ['faculty', 'user'],
    });
  }

  findOne(id: number) {
    return this.associationRepository.findOne({
      where: { id },
      relations: ['faculty', 'user'],
    });
  }

  update(id: number, updateAssociationDto: UpdateAssociationDto) {
    return `This action updates a #${id} association`;
  }

  remove(id: number) {
    return this.associationRepository.delete(id);
  }
}
