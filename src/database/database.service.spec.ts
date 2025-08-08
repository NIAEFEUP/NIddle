import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockDataSource: Partial<DataSource>;

  beforeEach(async () => {
    mockDataSource = {
      isInitialized: true,
      options: { type: 'sqlite', database: ':memory:' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create typeorm options for development', () => {
    const options = service.createTypeOrmOptions();
    expect(options.type).toBe('sqlite');
    expect(options.database).toBe('dev.db');
    expect(options.synchronize).toBe(true);
  });

  it('should create typeorm options for production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const options = service.createTypeOrmOptions();
    expect(options.type).toBe('postgres');
    expect(options.database).toBe('db');
    expect(options.synchronize).toBe(false);

    process.env.NODE_ENV = originalEnv;
  });
});
