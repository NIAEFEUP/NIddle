import { NotFoundException } from '@nestjs/common';
import { In, ObjectLiteral, Repository } from 'typeorm';

export async function validateAndGetRelations<T extends ObjectLiteral>(
  repository: Repository<T>,
  ids: number[],
  entityName: string,
): Promise<T[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const entities = await repository.findBy({
    id: In(ids),
  } as any);

  if (entities.length !== ids.length) {
    throw new NotFoundException(`One or more ${entityName} not found`);
  }

  return entities;
}
