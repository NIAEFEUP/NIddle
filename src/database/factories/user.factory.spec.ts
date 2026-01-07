import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../users/entities/user.entity';

interface MockedFactory {
  entity: unknown;
  factoryFn: () => User;
}

jest.mock('typeorm-extension', () => ({
  setSeederFactory: jest.fn(
    (entity: unknown, factoryFn: () => unknown): MockedFactory => {
      return { entity, factoryFn: factoryFn as () => User };
    },
  ),
}));

import userFactory from './user.factory';

describe('UserFactory', () => {
  it('should define a factory for User', () => {
    expect(setSeederFactory).toHaveBeenCalledWith(User, expect.any(Function));
    const factory = userFactory as unknown as MockedFactory;
    expect(factory.entity).toBe(User);
  });

  it('should generate a valid user', () => {
    const factory = userFactory as unknown as MockedFactory;
    const user = factory.factoryFn();

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBeTruthy();
    expect(user.email).toBeTruthy();
    expect(user.password).toBeDefined();
    expect(user.email).toMatch(/@/);
  });
});
