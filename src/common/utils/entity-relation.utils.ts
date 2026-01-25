import { NotFoundException } from '@nestjs/common';
import { In, ObjectLiteral, Repository, FindOptionsWhere } from 'typeorm';

export async function validateAndGetRelations<
  T extends ObjectLiteral & { id: number },
>(repository: Repository<T>, ids: number[], entityName: string): Promise<T[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(ids)];

  const entities = await repository.findBy({
    id: In(uniqueIds),
  } as FindOptionsWhere<T>);

  if (entities.length !== uniqueIds.length) {
    const foundIds = new Set(entities.map((e) => e.id));
    const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
    throw new NotFoundException(
      `One or more ${entityName} not found. Missing IDs: ${missingIds.join(', ')}`,
    );
  }

  return entities;
}
