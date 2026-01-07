import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { seed } from './seed';

interface MockDataSource {
  initialize: jest.Mock<Promise<void>>;
}

jest.mock('typeorm', () => {
  const actual = jest.requireActual<typeof import('typeorm')>('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

jest.mock('typeorm-extension', () => ({
  runSeeders: jest.fn().mockResolvedValue(undefined),
}));

describe('Seed Script', () => {
  it('should initialize data source and run seeders', async () => {
    await seed();

    expect(DataSource).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'postgres',
        database: 'niddle_db',
        entities: expect.any(Array) as unknown as (() => unknown)[],
        seeds: expect.any(Array) as unknown as string[],
        factories: expect.any(Array) as unknown as string[],
      }),
    );

    const mockDataSourceClass = DataSource as unknown as jest.Mock;
    const mockDataSourceInstance = mockDataSourceClass.mock.results[0]
      .value as MockDataSource;

    expect(mockDataSourceInstance.initialize).toHaveBeenCalled();
    expect(runSeeders).toHaveBeenCalledWith(mockDataSourceInstance);
  });
});
