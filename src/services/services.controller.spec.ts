import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Service } from './entity/service.entity';

describe('ServicesController', () => {
  let controller: ServicesController;
  const mockService = {
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
    const svc = {
      id: 1,
      name: 'x',
      location: 'L',
    } as any;

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
      const res = await controller.findOne(1 as any);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(res).toEqual(svc);
    });

    it('create should forward the dto to service.create', async () => {
      const dto = { name: 'a', location: 'b' } as any;
      mockService.create.mockResolvedValue(svc);
      const res = await controller.create(dto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual(svc);
    });

    it('update should forward id and dto to service.update', async () => {
      const dto = { name: 'updated' } as any;
      mockService.update.mockResolvedValue({ ...svc, ...dto });
      const res = await controller.update(1 as any, dto);
      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(res).toEqual({ ...svc, ...dto });
    });

    it('remove should call service.remove and return value', async () => {
      mockService.remove.mockResolvedValue(svc);
      const res = await controller.remove(1 as any);
      expect(mockService.remove).toHaveBeenCalledWith(1);
      expect(res).toEqual(svc);
    });
  });
});
