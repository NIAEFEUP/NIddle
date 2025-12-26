import { Test, TestingModule } from '@nestjs/testing';
import { CalendarsController } from './calendars.controller';
import { CalendarsService } from './calendars.service';

describe('CalendarsController', () => {
  let controller: CalendarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarsController],
      providers: [CalendarsService],
    }).compile();

    controller = module.get<CalendarsController>(CalendarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
