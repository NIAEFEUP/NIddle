import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { EntityNotFoundError } from "typeorm";
import { User } from "@/users/entities/user.entity";
import { UsersService } from "@/users/users.service";
import { AuthService } from "./auth.service";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;

  const mockUser: User = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "hashedPassword",
    isAdmin: false,
    associations: [],
    requests: [],
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signIn", () => {
    const signInDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should return an access token for valid credentials", async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue("mock.jwt.token");

      const result = await service.signIn(signInDto);

      expect(result).toEqual({ access_token: "mock.jwt.token" });
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        signInDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockUsersService.findOneByEmail.mockRejectedValue(
        new EntityNotFoundError(User, {}),
      );

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if password does not match", async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should rethrow other errors from findOneByEmail in signIn", async () => {
      const error = new Error("Database connection failed");
      mockUsersService.findOneByEmail.mockRejectedValue(error);

      await expect(service.signIn(signInDto)).rejects.toThrow(error);
    });
  });

  describe("validateUser", () => {
    const signInDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should return user if credentials are valid", async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(signInDto);

      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockUsersService.findOneByEmail.mockRejectedValue(
        new EntityNotFoundError(User, {}),
      );

      const result = await service.validateUser(signInDto);

      expect(result).toBeNull();
    });

    it("should return null if password does not match", async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(signInDto);

      expect(result).toBeNull();
    });

    it("should rethrow other errors from findOneByEmail in validateUser", async () => {
      const error = new Error("Database connection failed");
      mockUsersService.findOneByEmail.mockRejectedValue(error);

      await expect(service.validateUser(signInDto)).rejects.toThrow(error);
    });
  });
});
