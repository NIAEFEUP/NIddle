import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { SortOrder } from "@/common/sorting";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserFilterDto } from "./dto/user-filter.dto";
import { User } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
  let controller: UsersController;

  const mockUser: User = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "password",
    isAdmin: false,
    associations: [],
    requests: [],
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const createUserDto: CreateUserDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password#123",
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe("findAll", () => {
    it("should return a paginated response of users", async () => {
      const response = {
        data: [mockUser],
        meta: {
          page: 1,
          limit: 10,
          itemCount: 1,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
      mockUsersService.findAll.mockResolvedValue(response);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(response);
      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it("should pass sorting params to service", async () => {
      const response = {
        data: [mockUser],
        meta: {
          page: 1,
          limit: 10,
          itemCount: 1,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
      mockUsersService.findAll.mockResolvedValue(response);

      const filters: UserFilterDto = {
        page: 1,
        limit: 10,
        sortBy: "email",
        sortOrder: SortOrder.DESC,
      };
      const result = await controller.findAll(filters);

      expect(result).toEqual(response);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe("findOne", () => {
    it("should return a single user", async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne("1");

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith("1");
    });

    it("should throw NotFoundException if user not found", async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne("1")).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const updateUserDto: UpdateUserDto = { name: "Updated Name" };
      const updatedUser = { ...mockUser, name: "Updated Name" };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update("1", updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith("1", updateUserDto);
    });
  });

  describe("remove", () => {
    it("should remove a user", async () => {
      mockUsersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove("1");

      expect(result).toEqual(mockUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith("1");
    });
  });
});
