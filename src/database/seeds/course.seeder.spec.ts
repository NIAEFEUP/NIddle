import { DataSource, EntityTarget } from 'typeorm';
import { SeederFactoryManager } from 'typeorm-extension';
import CourseSeeder from './course.seeder';
import { Course } from '../../courses/entities/course.entity';

describe('CourseSeeder', () => {
  let seeder: CourseSeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockFactory = {
    saveMany: jest.fn(),
  };

  const mockGet = jest.fn().mockReturnValue(mockFactory);

  beforeEach(() => {
    seeder = new CourseSeeder();
    dataSource = {} as DataSource;
    factoryManager = {
      get: (entity: EntityTarget<any>) => mockGet(entity) as object,
    } as unknown as SeederFactoryManager;

    mockGet.mockClear();
    mockFactory.saveMany.mockClear();
  });

  it('should be defined', () => {
    expect(seeder).toBeDefined();
  });

  it('should seed courses', async () => {
    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(Course);
    expect(mockFactory.saveMany).toHaveBeenCalledWith(20);
  });
});
