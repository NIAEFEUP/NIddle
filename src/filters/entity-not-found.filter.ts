import { ExceptionFilter, Catch, NotFoundException, ArgumentsHost } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';

@Catch(EntityNotFoundError)
export class EntityNotFoundFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const entityMatch = exception.message.match(/entity of type "(\w+)"/);
    const entityName = entityMatch ? entityMatch[1] : 'Resource';

    const idMatch = exception.message.match(/"id":\s*(\d+)/);
    const id = idMatch ? idMatch[1] : 'specified';

    throw new NotFoundException(`${entityName} with id ${id} not found`);
  }
}
