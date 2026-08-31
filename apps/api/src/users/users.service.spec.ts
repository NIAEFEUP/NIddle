import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Association } from "@/associations/entities/association.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

jest.mock("bcrypt");

describe("UsersService", () => {
  let service: UsersService;

  const mockUser: User = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "hashedPassword",
    isAdmin: false,
    associations: [],
    requests: [],
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockAssociationRepository = {
    find: jest.fn(),
    findBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Association),
          useValue: mockAssociationRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("onApplicationBootstrap", () => {
    it("should skip if ADMIN_EMAIL is not set", async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "ADMIN_EMAIL") return undefined;
        if (key === "ADMIN_PASSWORD") return "password";
        return undefined;
      });

      await service.onApplicationBootstrap();

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });

    it("should skip if ADMIN_PASSWORD is not set", async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "ADMIN_EMAIL") return "admin@example.com";
        if (key === "ADMIN_PASSWORD") return undefined;
        return undefined;
      });

      await service.onApplicationBootstrap();

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });

    it("should skip if admin user already exists", async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "ADMIN_EMAIL") return "admin@example.com";
        if (key === "ADMIN_PASSWORD") return "Password#123";
        return undefined;
      });
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service.onApplicationBootstrap();

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: "admin@example.com" },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it("should create admin user if it does not exist", async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "ADMIN_EMAIL") return "admin@example.com";
        if (key === "ADMIN_PASSWORD") return "Password#123";
        return undefined;
      });
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        email: "admin@example.com",
        isAdmin: true,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: "admin@example.com",
        isAdmin: true,
      });

      await service.onApplicationBootstrap();

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: "admin@example.com" },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("Password#123", 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: "Admin",
        email: "admin@example.com",
        password: "hashedPassword",
        isAdmin: true,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should create and save a user", async () => {
      const createUserDto: CreateUserDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password#123",
      };
      mockUserRepository.create.mockReturnValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("Password#123", 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it("should create a user with associations", async () => {
      const mockAssociation = { id: "3", name: "Chess Club" };
      const createUserDto: CreateUserDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password#123",
        associationIds: ["3"],
      };
      mockUserRepository.create.mockReturnValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      mockAssociationRepository.findBy.mockResolvedValue([mockAssociation]);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        associations: [mockAssociation],
      });

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        ...mockUser,
        associations: [mockAssociation],
      });
      expect(mockAssociationRepository.findBy).toHaveBeenCalled();
    });

    it("should ignore null associationIds", async () => {
      const createUserDto: CreateUserDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password#123",
        associationIds: null as any,
      };
      mockUserRepository.create.mockReturnValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockAssociationRepository.findBy).not.toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return a paginated response of users", async () => {
      const users = [mockUser];
      mockUserRepository.findAndCount.mockResolvedValue([users, users.length]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(users);
      expect(result.meta.totalItems).toBe(users.length);
      expect(result.meta.totalPages).toBe(1);
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { id: "ASC" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a user by ID", async () => {
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);

      const result = await service.findOne("1");

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should throw if user not found", async () => {
      mockUserRepository.findOneOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.findOne("1")).rejects.toThrow("Not found");
    });
  });

  describe("findOneWithAssociations", () => {
    it("should return a user with associations by ID", async () => {
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);

      const result = await service.findOneWithAssociations("1");

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["associations"],
      });
    });

    it("should throw if user with associations not found", async () => {
      mockUserRepository.findOneOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.findOneWithAssociations("1")).rejects.toThrow(
        "Not found",
      );
    });
  });

  describe("findOneByEmail", () => {
    it("should return a user by email", async () => {
      mockUserRepository.findOneByOrFail.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail("john@example.com");

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneByOrFail).toHaveBeenCalledWith({
        email: "john@example.com",
      });
    });

    it("should throw if user email not found", async () => {
      mockUserRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.findOneByEmail("john@example.com")).rejects.toThrow(
        "Not found",
      );
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const updateUserDto: UpdateUserDto = { name: "Updated Name" };
      const updatedUser = { ...mockUser, name: "Updated Name" };
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockUserRepository.merge.mockImplementation((target, source) => {
        Object.assign(target, source);
      });
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update("1", updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it("should update user password if provided", async () => {
      const updateUserDto: UpdateUserDto = { password: "NewPassword#1" };
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockUserRepository.merge.mockImplementation((target, source) => {
        Object.assign(target, source);
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        password: "newHashedPassword",
      });

      await service.update("1", updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword#1", 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it("should update user associations if associationIds provided", async () => {
      const mockAssociation = { id: "3", name: "Chess Club" };
      const updateUserDto: UpdateUserDto = { associationIds: ["3"] };
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockUserRepository.merge.mockImplementation((target, source) => {
        Object.assign(target, source);
      });
      mockAssociationRepository.findBy.mockResolvedValue([mockAssociation]);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        associations: [mockAssociation],
      });

      await service.update("1", updateUserDto);

      expect(mockAssociationRepository.findBy).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it("should ignore null associationIds on update", async () => {
      const updateUserDto: UpdateUserDto = { associationIds: null as any };
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockUserRepository.merge.mockImplementation((target, source) => {
        Object.assign(target, source);
      });
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.update("1", updateUserDto);

      expect(mockAssociationRepository.findBy).not.toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should remove a user", async () => {
      mockUserRepository.findOneOrFail.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove("1");

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(mockUserRepository.delete).toHaveBeenCalledWith("1");
    });
  });
});
