import { EntityNotFoundFilter } from './entity-not-found.filter';
import { EntityNotFoundError } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('EntityNotFoundFilter', () => {
  let filter: EntityNotFoundFilter;

  beforeEach(() => {
    filter = new EntityNotFoundFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should throw NotFoundException with entity name and id', () => {
    const message =
      'Could not find any entity of type "User" matching: { "id": 1 }';
    const exception = { message } as EntityNotFoundError;

    expect(() => filter.catch(exception)).toThrow(NotFoundException);
    try {
      filter.catch(exception);
    } catch (e) {
      const error = e as NotFoundException;
      expect(error.message).toBe('User with id 1 not found');
    }
  });

  it('should handle different entity names and IDs', () => {
    const message =
      'Could not find any entity of type "Course" matching: { "id": 123 }';
    const exception = { message } as EntityNotFoundError;

    try {
      filter.catch(exception);
    } catch (e) {
      const error = e as NotFoundException;
      expect(error.message).toBe('Course with id 123 not found');
    }
  });

  it('should throw NotFoundException with default "Resource" and "specified" id if message does not match', () => {
    const exception = {
      message: 'Something went wrong',
    } as EntityNotFoundError;

    try {
      filter.catch(exception);
    } catch (e) {
      const error = e as NotFoundException;
      expect(error.message).toBe('Resource with id specified not found');
    }
  });

  it('should return "specified" for non-numeric IDs with current implementation', () => {
    const message =
      'Could not find any entity of type "User" matching: { "id": "abc" }';
    const exception = { message } as EntityNotFoundError;

    try {
      filter.catch(exception);
    } catch (e) {
      const error = e as NotFoundException;
      expect(error.message).toBe('User with id specified not found');
    }
  });
});
