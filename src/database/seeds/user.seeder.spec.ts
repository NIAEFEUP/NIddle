import { DataSource, EntityTarget } from 'typeorm';
import { SeederFactoryManager } from 'typeorm-extension';
import UserSeeder from './1-user.seeder';
import { User } from '../../users/entities/user.entity';

describe('UserSeeder', () => {
  let seeder: UserSeeder;
  let dataSource: DataSource;
  let factoryManager: SeederFactoryManager;

  const mockFactory = {
    saveMany: jest.fn(),
  };

  const mockGet = jest.fn().mockReturnValue(mockFactory);

  beforeEach(() => {
    seeder = new UserSeeder();
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

  it('should seed users', async () => {
    await seeder.run(dataSource, factoryManager);

    expect(mockGet).toHaveBeenCalledWith(User);
    expect(mockFactory.saveMany).toHaveBeenCalledWith(5);
  });
});
