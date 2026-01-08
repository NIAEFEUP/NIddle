import { validateAndGetRelations } from './entity-relation.utils';
import { Repository, ObjectLiteral, In } from 'typeorm';

interface TestEntity extends ObjectLiteral {
  id: number;
}

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('validateAndGetRelations', () => {
  let mockRepository: MockRepository<TestEntity>;

  beforeEach(() => {
    mockRepository = {
      findBy: jest.fn(),
    };
  });

  it('should handle duplicate IDs correctly', async () => {
    const ids = [1, 1, 2];
    const entities: TestEntity[] = [{ id: 1 }, { id: 2 }];

    mockRepository.findBy?.mockResolvedValue(entities);

    const result = await validateAndGetRelations(
      mockRepository as unknown as Repository<TestEntity>,
      ids,
      'TestEntity',
    );

    expect(result).toEqual(entities);
    expect(mockRepository.findBy).toHaveBeenCalledWith({
      id: In([1, 2]),
    });
  });

  it('should throw NotFoundException if strictly unique entities count mismatch', async () => {
    const ids = [1, 2, 3];
    const entities: TestEntity[] = [{ id: 1 }, { id: 2 }];

    mockRepository.findBy?.mockResolvedValue(entities);

    await expect(
      validateAndGetRelations(
        mockRepository as unknown as Repository<TestEntity>,
        ids,
        'TestEntity',
      ),
    ).rejects.toThrow('One or more TestEntity not found. Missing IDs: 3');
  });

  it('should return empty array if input ids list is empty', async () => {
    const ids: number[] = [];

    const result = await validateAndGetRelations(
      mockRepository as unknown as Repository<TestEntity>,
      ids,
      'TestEntity',
    );

    expect(result).toEqual([]);
    expect(mockRepository.findBy).not.toHaveBeenCalled();
  });

  it('should list all missing IDs in the error message', async () => {
    const ids = [1, 2, 3, 4];
    const entities: TestEntity[] = [{ id: 1 }, { id: 4 }];

    mockRepository.findBy?.mockResolvedValue(entities);

    await expect(
      validateAndGetRelations(
        mockRepository as unknown as Repository<TestEntity>,
        ids,
        'TestEntity',
      ),
    ).rejects.toThrow('One or more TestEntity not found. Missing IDs: 2, 3');
  });
});
