import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AssociationsService } from './associations.service';
import { Association } from './entities/association.entity';
import { UpdateAssociationDto } from './dto/update-association.dto';

describe('AssociationsService', () => {
  let service: AssociationsService;
  let associationRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    associationRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationsService,
        {
          provide: getRepositoryToken(Association),
          useValue: associationRepository,
        },
      ],
    }).compile();

    service = module.get<AssociationsService>(AssociationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates an association', async () => {
    const createDto = { name: 'Chess Club' } as Association;
    associationRepository.save.mockResolvedValue(createDto);

    const result = await service.create(createDto);

    expect(associationRepository.save).toHaveBeenCalledWith(createDto);
    expect(result).toBe(createDto);
  });

  it('finds all associations without faculty filter', async () => {
    const data = [{ id: 1, name: 'Chess Club' }];
    associationRepository.find.mockResolvedValue(data);

    const result = await service.findAll();

    expect(associationRepository.find).toHaveBeenCalledWith({
      relations: ['faculty', 'user'],
    });
    expect(result).toBe(data);
  });

  it('finds all associations for a faculty', async () => {
    const data = [{ id: 2, name: 'Robotics' }];
    associationRepository.find.mockResolvedValue(data);

    const result = await service.findAll(10);

    expect(associationRepository.find).toHaveBeenCalledWith({
      where: { faculty: { id: 10 } },
      relations: ['faculty', 'user'],
    });
    expect(result).toBe(data);
  });

  it('finds one association by id', async () => {
    const data = { id: 3, name: 'Drama' };
    associationRepository.findOne.mockResolvedValue(data);

    const result = await service.findOne(3);

    expect(associationRepository.findOne).toHaveBeenCalledWith({
      where: { id: 3 },
      relations: ['faculty', 'user'],
    });
    expect(result).toBe(data);
  });

  it('updates an association', async () => {
    const updateDto: UpdateAssociationDto = { name: 'Drama Club' };
    const updateResult = { affected: 1 };
    associationRepository.update.mockResolvedValue(updateResult);

    const result = await service.update(3, updateDto);

    expect(associationRepository.update).toHaveBeenCalledWith(3, updateDto);
    expect(result).toBe(updateResult);
  });

  it('removes an association', async () => {
    const deleteResult = { affected: 1 };
    associationRepository.delete.mockResolvedValue(deleteResult);

    const result = await service.remove(3);

    expect(associationRepository.delete).toHaveBeenCalledWith(3);
    expect(result).toBe(deleteResult);
  });
});
