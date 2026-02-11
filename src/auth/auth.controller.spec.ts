import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entities/user.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/signin.dto";

describe("AuthController", () => {
  let controller: AuthController;

  const mockUser: User = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "hashedPassword",
  };

  const mockAccessToken = {
    access_token: "mock.jwt.token",
  };

  const mockAuthService = {
    register: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getProfile", () => {
    it("should return the user from the request", () => {
      const req = {
        user: { id: mockUser.id, name: mockUser.name, email: mockUser.email },
      };
      const result = controller.getProfile(req);
      expect(result).toEqual(req.user);
    });
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const createUserDto: CreateUserDto = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe("signIn", () => {
    it("should sign in a user and return a token", async () => {
      const signInDto: SignInDto = {
        email: "test@example.com",
        password: "password123",
      };

      mockAuthService.signIn.mockResolvedValue(mockAccessToken);

      const result = await controller.signIn(signInDto);

      expect(result).toEqual(mockAccessToken);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });
});
