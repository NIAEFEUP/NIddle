import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

/**
 * Validates that exactly one of the specified fields is defined (XOR logic).
 * Throws a validation error if both are defined or neither is defined.
 *
 * Apply this decorator to any property of the class (conventionally the first
 * of the mutually-exclusive fields).
 *
 * @param fields - Array of field names, exactly one of which must be defined
 * @param validationOptions - Optional class-validator options
 */
export function ValidateOneOf(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "validateOneOf",
      target: (object as any).constructor,
      propertyName,
      options: validationOptions,
      constraints: fields,
      validator: {
        validate(_value: any, args: ValidationArguments): boolean {
          const obj = args.object as Record<string, any>;
          const definedCount = args.constraints.filter(
            (field) => obj[field] !== undefined && obj[field] !== null,
          ).length;
          return definedCount === 1;
        },
        defaultMessage(args: ValidationArguments): string {
          const fieldList = args.constraints.join(", ");
          return `Exactly one of [${fieldList}] must be provided, not both and not neither.`;
        },
      },
    });
  };
}
