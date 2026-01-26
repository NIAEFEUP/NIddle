import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user if validation is successful', async () => {
    const user = { id: 1, email: 'test@example.com' } as User;
    mockAuthService.validateUser.mockResolvedValue(user);

    const result = await strategy.validate('test@example.com', 'password');

    expect(result).toEqual(user);
    expect(mockAuthService.validateUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should throw UnauthorizedException if validation fails', async () => {
    mockAuthService.validateUser.mockResolvedValue(null);

    await expect(
      strategy.validate('test@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
