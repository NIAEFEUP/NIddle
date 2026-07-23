import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "@/users/users.service";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("test-secret"),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneWithAssociations: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
    usersService = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  it("should throw error if JWT_SECRET is not set", () => {
    jest.spyOn(configService, "get").mockReturnValue(null);
    try {
      new JwtStrategy(configService, usersService);
    } catch (error) {
      expect((error as Error).message).toBe("JWT_SECRET is not set");
    }
  });

  it("should validate and return user payload", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      isAdmin: false,
      associations: [],
    };
    jest
      .spyOn(usersService, "findOneWithAssociations")
      .mockResolvedValue(mockUser as any);

    const payload = { sub: 1, email: "test@example.com", isAdmin: false };
    const result = await strategy.validate(payload);
    expect(result).toEqual(mockUser);
    expect(usersService.findOneWithAssociations).toHaveBeenCalledWith(1);
  });
});
