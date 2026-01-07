import { setSeederFactory } from 'typeorm-extension';
import { Course } from '../../courses/entities/course.entity';

interface MockedFactory {
  entity: unknown;
  factoryFn: () => Course;
}

jest.mock('typeorm-extension', () => ({
  setSeederFactory: jest.fn(
    (entity: unknown, factoryFn: () => unknown): MockedFactory => {
      return { entity, factoryFn: factoryFn as () => Course };
    },
  ),
}));

import courseFactory from './course.factory';

describe('CourseFactory', () => {
  it('should define a factory for Course', () => {
    expect(setSeederFactory).toHaveBeenCalledWith(Course, expect.any(Function));
    const factory = courseFactory as unknown as MockedFactory;
    expect(factory.entity).toBe(Course);
  });

  it('should generate a valid course', () => {
    const factory = courseFactory as unknown as MockedFactory;
    const course = factory.factoryFn();

    expect(course).toBeInstanceOf(Course);
    expect(course.name).toBeTruthy();
    expect(course.acronym).toBeTruthy();
    expect(course.acronym.length).toBeGreaterThanOrEqual(2);
  });
});
