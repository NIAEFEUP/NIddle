import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

@ValidatorConstraint({ name: 'ExistsInDb', async: true })
@Injectable()
export class ExistsInDbConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    const [EntityClass, findField = 'id'] = args.constraints as [
      EntityTarget<ObjectLiteral>,
      string,
    ];
    if (value == null) return true;
    const repo = this.dataSource.getRepository(EntityClass);
    const entity = await repo.findOneBy({ [findField]: value });
    return !!entity;
  }

  defaultMessage(args: ValidationArguments): string {
    const [EntityClass, findField = 'id'] = args.constraints as [
      EntityTarget<ObjectLiteral>,
      string,
    ];
    const entityName =
      typeof EntityClass === 'function' ? EntityClass.name : 'Entity';
    return `${entityName} with this ${findField} does not exist`;
  }
}

export function ExistsInDb(
  EntityClass: EntityTarget<ObjectLiteral>,
  findField = 'id',
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [EntityClass, findField],
      validator: ExistsInDbConstraint,
    });
  };
}
