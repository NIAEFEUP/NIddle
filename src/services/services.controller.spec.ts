import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entity/service.entity';
import { Schedule } from './entity/schedule.entity';

describe('ServicesController', () => {
  let controller: ServicesController;
  const mockService: Record<string, jest.Mock> = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('delegation', () => {
    const svc: Partial<Service> = {
      id: 1,
      name: 'x',
      location: 'L',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('findAll should call service.findAll and return its value', async () => {
      mockService.findAll.mockResolvedValue([svc]);
      const res = await controller.findAll();
      expect(mockService.findAll).toHaveBeenCalled();
      expect(res).toEqual([svc]);
    });

    it('findOne should call service.findOne with numeric id', async () => {
      mockService.findOne.mockResolvedValue(svc);
      const res = await controller.findOne(1);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(res).toEqual(svc);
    });

    it('create should forward the dto to service.create', async () => {
      const dto: CreateServiceDto = {
        name: 'a',
        location: 'b',
        schedule: { id: 0, timeIntervals: [] } as Schedule,
      };
      mockService.create.mockResolvedValue(svc);
      const res = await controller.create(dto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual(svc);
    });

    it('update should forward id and dto to service.update', async () => {
      const dto: UpdateServiceDto = { name: 'updated' } as UpdateServiceDto;
      mockService.update.mockResolvedValue({ ...svc, ...dto });
      const res = await controller.update(1, dto);
      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(res).toEqual({ ...svc, ...dto });
    });

    it('remove should call service.remove and return value', async () => {
      mockService.remove.mockResolvedValue(svc);
      const res = await controller.remove(1);
      expect(mockService.remove).toHaveBeenCalledWith(1);
      expect(res).toEqual(svc);
    });
  });
});
