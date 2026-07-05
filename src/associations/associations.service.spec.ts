import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@/users/entities/user.entity";
import { AssociationsService } from "./associations.service";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { Association } from "./entities/association.entity";

describe("AssociationsService", () => {
  let service: AssociationsService;

  const mockUser: User = {
    id: 1,
    name: "Chess Club Admin",
    email: "chess@example.com",
    password: "hashedpassword",
  };

  const mockAssociation: Association = {
    id: 1,
    name: "Chess Club",
    user: mockUser,
    events: [],
    services: [],
  };

  const mockAssociationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOneByOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationsService,
        {
          provide: getRepositoryToken(Association),
          useValue: mockAssociationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AssociationsService>(AssociationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an association", async () => {
      const createDto: CreateAssociationDto = {
        name: "Chess Club",
        userId: 1,
      };
      mockAssociationRepository.create.mockReturnValue({ ...mockAssociation });
      mockUserRepository.findOneByOrFail.mockResolvedValue(mockUser);
      mockAssociationRepository.save.mockResolvedValue(mockAssociation);

      const result = await service.create(createDto);

      expect(result).toEqual(mockAssociation);
      expect(mockAssociationRepository.create).toHaveBeenCalledWith({
        name: "Chess Club",
      });
      expect(mockUserRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(mockAssociationRepository.save).toHaveBeenCalled();
    });

    it("should throw if user not found", async () => {
      const createDto: CreateAssociationDto = {
        name: "Chess Club",
        userId: 999,
      };
      mockAssociationRepository.create.mockReturnValue({ ...mockAssociation });
      mockUserRepository.findOneByOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.create(createDto)).rejects.toThrow("Not found");
    });
  });

  describe("findAll", () => {
    it("should return an array of associations", async () => {
      mockAssociationRepository.find.mockResolvedValue([mockAssociation]);

      const result = await service.findAll();

      expect(result).toEqual([mockAssociation]);
      expect(mockAssociationRepository.find).toHaveBeenCalledWith({
        relations: ["user"],
      });
    });
  });

  describe("findOne", () => {
    it("should return a single association", async () => {
      mockAssociationRepository.findOneOrFail.mockResolvedValue(
        mockAssociation,
      );

      const result = await service.findOne(1);

      expect(result).toEqual(mockAssociation);
      expect(mockAssociationRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["user"],
      });
    });

    it("should throw if association not found", async () => {
      mockAssociationRepository.findOneOrFail.mockRejectedValue(
        new Error("Not found"),
      );

      await expect(service.findOne(999)).rejects.toThrow("Not found");
    });
  });

  describe("update", () => {
    it("should update and return the association", async () => {
      const updateDto: UpdateAssociationDto = {
        name: "New Name",
      };
      mockAssociationRepository.findOneOrFail.mockResolvedValue({
        ...mockAssociation,
      });
      mockAssociationRepository.merge.mockImplementation((a, d) =>
        Object.assign(a, d),
      );
      mockAssociationRepository.save.mockResolvedValue({
        ...mockAssociation,
        name: "New Name",
      });

      const result = await service.update(1, updateDto);

      expect(result.name).toEqual("New Name");
      expect(mockAssociationRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["user"],
      });
      expect(mockAssociationRepository.save).toHaveBeenCalled();
    });

    it("should update association user relation", async () => {
      const updateDto: UpdateAssociationDto = {
        userId: 2,
      };
      const newUser = { ...mockUser, id: 2, name: "New Admin" };
      mockAssociationRepository.findOneOrFail.mockResolvedValue({
        ...mockAssociation,
      });
      mockUserRepository.findOneByOrFail.mockResolvedValue(newUser);
      mockAssociationRepository.save.mockResolvedValue({
        ...mockAssociation,
        user: newUser,
      });

      const result = await service.update(1, updateDto);

      expect(result.user).toEqual(newUser);
      expect(mockUserRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 2,
      });
    });
  });

  describe("remove", () => {
    it("should delete the association", async () => {
      mockAssociationRepository.findOneByOrFail.mockResolvedValue(
        mockAssociation,
      );
      mockAssociationRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual(mockAssociation);
      expect(mockAssociationRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: 1,
      });
      expect(mockAssociationRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
