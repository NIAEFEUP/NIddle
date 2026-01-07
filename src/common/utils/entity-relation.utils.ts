import { NotFoundException } from '@nestjs/common';
import { In, ObjectLiteral, Repository, FindOptionsWhere } from 'typeorm';

export async function validateAndGetRelations<
  T extends ObjectLiteral & { id: number },
>(repository: Repository<T>, ids: number[], entityName: string): Promise<T[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const entities = await repository.findBy({
    id: In(ids),
  } as FindOptionsWhere<T>);

  if (entities.length !== ids.length) {
    throw new NotFoundException(`One or more ${entityName} not found`);
  }

  return entities;
}
