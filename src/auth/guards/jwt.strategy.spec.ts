import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should throw error if JWT_SECRET is not set', () => {
    jest.spyOn(configService, 'get').mockReturnValue(null);
    try {
      new JwtStrategy(configService);
    } catch (error) {
      expect((error as Error).message).toBe('JWT_SECRET is not set');
    }
  });

  it('should validate and return user payload', () => {
    const payload = { sub: 1, email: 'test@example.com' };
    const result = strategy.validate(payload);
    expect(result).toEqual({ id: 1, email: 'test@example.com' });
  });
});
