import { DataSource } from "typeorm";
import DocumentSeeder from "@/database/seeds/7-document.seeder";
import { Document } from "@/docs/entities/document.entity";
import { DocumentHistory } from "@/docs/entities/document-history.entity";
import { User } from "@/users/entities/user.entity";

describe("DocumentSeeder", () => {
  let seeder: DocumentSeeder;
  let dataSource: DataSource;

  const mockDocumentRepo = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto) => ({ id: "doc-uuid", ...dto })),
    save: jest.fn().mockImplementation((doc) => Promise.resolve(doc)),
  };

  const mockHistoryRepo = {
    create: jest
      .fn()
      .mockImplementation((dto) => ({ id: "hist-uuid", ...dto })),
    save: jest.fn().mockImplementation((hist) => Promise.resolve(hist)),
  };

  const mockUserRepo = {
    findOne: jest.fn().mockResolvedValue({
      id: "admin-uuid",
      email: "admin@example.com",
      isAdmin: true,
    }),
  };

  beforeEach(() => {
    seeder = new DocumentSeeder();
    dataSource = {
      getRepository: jest.fn().mockImplementation((target) => {
        if (target === Document) return mockDocumentRepo;
        if (target === DocumentHistory) return mockHistoryRepo;
        if (target === User) return mockUserRepo;
        return {};
      }),
    } as unknown as DataSource;

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(seeder).toBeDefined();
  });

  it("should seed documents if they do not exist", async () => {
    mockDocumentRepo.findOne.mockResolvedValue(null);

    await seeder.run(dataSource);

    expect(mockUserRepo.findOne).toHaveBeenCalledWith({
      where: { email: "admin@example.com" },
    });
    expect(mockDocumentRepo.save).toHaveBeenCalledTimes(2);
    expect(mockHistoryRepo.save).toHaveBeenCalledTimes(2);
  });

  it("should skip existing documents", async () => {
    mockDocumentRepo.findOne.mockResolvedValue({ id: "existing-uuid" });

    await seeder.run(dataSource);

    expect(mockDocumentRepo.save).not.toHaveBeenCalled();
    expect(mockHistoryRepo.save).not.toHaveBeenCalled();
  });
});
