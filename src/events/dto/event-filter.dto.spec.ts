import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { EventFilterDto } from './event-filter.dto';

describe('EventFilterDto', () => {
  it('converts numeric strings to numbers using @Type', () => {
    const plain = { year: '2025', facultyId: '1', courseId: '2' };
    const inst = plainToInstance(EventFilterDto, plain);

    expect(typeof inst.year).toBe('number');
    expect(inst.year).toBe(2025);

    expect(typeof inst.facultyId).toBe('number');
    expect(inst.facultyId).toBe(1);

    expect(typeof inst.courseId).toBe('number');
    expect(inst.courseId).toBe(2);
  });

  it('keeps properties undefined when not provided', () => {
    const inst = plainToInstance(EventFilterDto, {});
    expect(inst.year).toBeUndefined();
    expect(inst.facultyId).toBeUndefined();
    expect(inst.courseId).toBeUndefined();
  });
});
