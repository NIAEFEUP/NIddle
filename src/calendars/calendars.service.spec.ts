import { Test, TestingModule } from '@nestjs/testing';
import { CalendarsService } from './calendars.service';

describe('CalendarsService', () => {
  let service: CalendarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarsService],
    }).compile();

    service = module.get<CalendarsService>(CalendarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
