import * as fs from "node:fs";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DocsService, getDocumentsUploadDir } from "@/docs/docs.service";
import { CreateDocumentDto } from "@/docs/dto/create-document.dto";
import { Document } from "@/docs/entities/document.entity";
import { DocumentHistory } from "@/docs/entities/document-history.entity";
import { User } from "@/users/entities/user.entity";

describe("DocsService", () => {
  let service: DocsService;

  const mockUser = new User({
    id: "user-1",
    email: "admin@example.com",
    isAdmin: true,
  });

  const mockDocument: Document = new Document({
    id: "doc-1",
    slug: "terms-of-service",
    title: "Terms of Service",
    subtitle: "Effective 2026",
    description: "Terms description",
    version: 1,
    isPublished: true,
    sections: [
      {
        title: "1. Acceptance",
        content: "You agree to these **terms**.",
        order: 1,
        sections: [
          {
            title: "1.1 Eligibility",
            content: "Must be a student.",
            order: 1,
          },
        ],
      },
    ],
    pdfPath: "doc-123.pdf",
    pdfOriginalName: "terms.pdf",
    pdfMimeType: "application/pdf",
    pdfSize: 1024,
    changeSummary: "Initial version",
    author: mockUser,
  });

  const mockHistory = new DocumentHistory({
    id: "hist-1",
    documentId: "doc-1",
    version: 1,
    title: "Terms of Service",
    subtitle: "Effective 2026",
    sections: mockDocument.sections,
    pdfPath: "doc-123.pdf",
    pdfOriginalName: "terms.pdf",
    changeSummary: "Initial version",
    author: mockUser,
    authorEmail: "admin@example.com",
  });

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockDocument]),
  };

  const mockDocumentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        {
          provide: getRepositoryToken(DocumentHistory),
          useValue: mockHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<DocsService>(DocsService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getDocumentsUploadDir", () => {
    const originalEnv = process.env.DOCUMENTS_UPLOAD_DIR;

    afterEach(() => {
      process.env.DOCUMENTS_UPLOAD_DIR = originalEnv;
    });

    it("returns env variable if set", () => {
      process.env.DOCUMENTS_UPLOAD_DIR = "/custom/docs/dir";
      expect(getDocumentsUploadDir()).toBe("/custom/docs/dir");
    });

    it("returns default path if env not set", () => {
      delete process.env.DOCUMENTS_UPLOAD_DIR;
      expect(getDocumentsUploadDir()).toContain("uploads");
    });
  });

  describe("create", () => {
    it("should create document and initial history entry", async () => {
      const createDto: CreateDocumentDto = {
        title: "Terms of Service",
        subtitle: "Effective 2026",
        sections: mockDocument.sections,
      };

      mockDocumentRepository.findOne.mockResolvedValue(null);
      mockDocumentRepository.create.mockReturnValue(mockDocument);
      mockDocumentRepository.save.mockResolvedValue(mockDocument);
      mockHistoryRepository.create.mockReturnValue(mockHistory);
      mockHistoryRepository.save.mockResolvedValue(mockHistory);

      const result = await service.create(createDto, mockUser);

      expect(result).toEqual(mockDocument);
      expect(mockDocumentRepository.create).toHaveBeenCalled();
      expect(mockHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: mockDocument.id,
          version: 1,
        }),
      );
      expect(mockHistoryRepository.save).toHaveBeenCalled();
    });

    it("should create document when user is undefined and sections are omitted", async () => {
      const createDto: CreateDocumentDto = {
        title: "Terms of Service",
      };

      mockDocumentRepository.findOne.mockResolvedValue(null);
      mockDocumentRepository.create.mockReturnValue(mockDocument);
      mockDocumentRepository.save.mockResolvedValue(mockDocument);
      mockHistoryRepository.create.mockReturnValue(mockHistory);
      mockHistoryRepository.save.mockResolvedValue(mockHistory);

      const result = await service.create(createDto);
      expect(result).toEqual(mockDocument);
    });

    it("should throw ConflictException if slug already exists", async () => {
      const createDto: CreateDocumentDto = {
        title: "Terms of Service",
      };
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      await expect(service.create(createDto, mockUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw BadRequestException if slug is reserved", async () => {
      const createDto: CreateDocumentDto = {
        title: "Swagger",
      };

      await expect(service.create(createDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if title yields empty slug", async () => {
      const createDto: CreateDocumentDto = {
        title: "???",
      };

      await expect(service.create(createDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("createFromPdf", () => {
    const mockFile = {
      mimetype: "application/pdf",
      originalname: "student-guidelines.pdf",
      filename: "doc-student-guidelines.pdf",
      path: "/tmp/doc-student-guidelines.pdf",
      size: 5000,
    } as Express.Multer.File;

    it("should create document directly from uploaded PDF with auto-derived title and slug", async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);
      mockDocumentRepository.create.mockImplementation((doc) => doc);
      mockDocumentRepository.save.mockImplementation((doc) =>
        Promise.resolve({ ...doc, id: "doc-1" }),
      );
      mockHistoryRepository.create.mockReturnValue(mockHistory);
      mockHistoryRepository.save.mockResolvedValue(mockHistory);

      const result = await service.createFromPdf(mockFile, {}, mockUser);

      expect(result.id).toBe("doc-1");
      expect(mockDocumentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Student Guidelines",
          slug: "student-guidelines",
          pdfPath: "doc-student-guidelines.pdf",
          version: 1,
        }),
      );
      expect(mockHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 1,
          pdfPath: "doc-student-guidelines.pdf",
        }),
      );
    });

    it("should create document with explicit DTO parameters", async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);
      mockDocumentRepository.create.mockImplementation((doc) => doc);
      mockDocumentRepository.save.mockImplementation((doc) =>
        Promise.resolve({ ...doc, id: "doc-2" }),
      );
      mockHistoryRepository.create.mockReturnValue(mockHistory);
      mockHistoryRepository.save.mockResolvedValue(mockHistory);

      const effectiveDate = new Date("2026-01-01");
      const result = await service.createFromPdf(
        mockFile,
        {
          title: "Explicit Title",
          subtitle: "Explicit Subtitle",
          slug: "custom-slug",
          description: "Custom Description",
          changeSummary: "Custom Summary",
          isPublished: false,
          effectiveDate,
        },
        mockUser,
      );

      expect(result.id).toBe("doc-2");
      expect(mockDocumentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Explicit Title",
          slug: "custom-slug",
          subtitle: "Explicit Subtitle",
          description: "Custom Description",
          isPublished: false,
          effectiveDate,
        }),
      );
    });

    it("should throw if file is missing", async () => {
      await expect(
        service.createFromPdf(null as any, {}, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject non-pdf files and delete file if path exists", async () => {
      const invalidFile = {
        mimetype: "image/png",
        originalname: "picture.png",
        path: "/tmp/fake.png",
      } as Express.Multer.File;

      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      const unlinkSpy = jest
        .spyOn(fs, "unlinkSync")
        .mockImplementation(() => {});

      await expect(
        service.createFromPdf(invalidFile, {}, mockUser),
      ).rejects.toThrow(BadRequestException);
      expect(unlinkSpy).toHaveBeenCalledWith("/tmp/fake.png");
    });

    it("should throw BadRequestException if generated slug is reserved", async () => {
      const pdf = {
        mimetype: "application/pdf",
        originalname: "swagger.pdf",
        path: "/tmp/swagger.pdf",
      } as Express.Multer.File;

      await expect(service.createFromPdf(pdf, {}, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw ConflictException if slug already exists in database", async () => {
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      await expect(
        service.createFromPdf(mockFile, { slug: "terms-of-service" }, mockUser),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("findAll", () => {
    it("should query published documents for public users", async () => {
      const result = await service.findAll({ page: 1, limit: 10 }, false);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "document.isPublished = :isPublished",
        { isPublished: true },
      );
      expect(result).toEqual([mockDocument]);
    });

    it("should allow admin to filter by isPublished boolean", async () => {
      await service.findAll({ page: 1, limit: 10, isPublished: false }, true);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "document.isPublished = :isPublished",
        { isPublished: false },
      );
    });

    it("should allow search filtering", async () => {
      await service.findAll({ page: 1, limit: 10, search: "terms" }, true);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(document.title) LIKE :search"),
        { search: "%terms%" },
      );
    });
  });

  describe("findOneBySlug", () => {
    it("should return document if found and published", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);

      const result = await service.findOneBySlug("terms-of-service", false);
      expect(result).toEqual(mockDocument);
    });

    it("should throw NotFoundException if document is unpublished and user is not admin", async () => {
      const draftDoc = new Document({ ...mockDocument, isPublished: false });
      mockDocumentRepository.findOneOrFail.mockResolvedValue(draftDoc);

      await expect(
        service.findOneBySlug("terms-of-service", false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update document, increment version, and record history", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue({
        ...mockDocument,
      });
      mockDocumentRepository.save.mockImplementation((doc) =>
        Promise.resolve(doc),
      );
      mockHistoryRepository.create.mockReturnValue(mockHistory);
      mockHistoryRepository.save.mockResolvedValue(mockHistory);

      const effectiveDate = new Date("2027-01-01");
      const result = await service.update(
        "terms-of-service",
        {
          title: "New Title",
          subtitle: "Updated 2027",
          description: "New description",
          sections: [],
          isPublished: true,
          effectiveDate,
          changeSummary: "Annual legal review",
        },
        mockUser,
      );

      expect(result.version).toBe(2);
      expect(result.subtitle).toBe("Updated 2027");
      expect(mockHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 2,
          changeSummary: "Annual legal review",
        }),
      );
    });

    it("should allow changing slug if target slug does not exist", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue({
        ...mockDocument,
      });
      mockDocumentRepository.findOne.mockResolvedValue(null);
      mockDocumentRepository.save.mockImplementation((doc) =>
        Promise.resolve(doc),
      );
      mockHistoryRepository.create.mockReturnValue(mockHistory);
      mockHistoryRepository.save.mockResolvedValue(mockHistory);

      const result = await service.update("terms-of-service", {
        slug: "terms-v2",
      });

      expect(result.slug).toBe("terms-v2");
    });

    it("should throw if target slug is reserved", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue({
        ...mockDocument,
      });

      await expect(
        service.update("terms-of-service", { slug: "swagger" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ConflictException if new slug already exists", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue({
        ...mockDocument,
      });
      mockDocumentRepository.findOne.mockResolvedValue(
        new Document({ id: "other", slug: "terms-v2" }),
      );

      await expect(
        service.update("terms-of-service", { slug: "terms-v2" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("remove", () => {
    it("should delete document and unlink pdf if present", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      mockDocumentRepository.delete.mockResolvedValue({ affected: 1 });
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      const unlinkSpy = jest
        .spyOn(fs, "unlinkSync")
        .mockImplementation(() => {});

      const result = await service.remove("terms-of-service");
      expect(result).toEqual(mockDocument);
      expect(unlinkSpy).toHaveBeenCalled();
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith(
        mockDocument.id,
      );
    });
  });

  describe("uploadPdf", () => {
    it("should reject non-pdf files", async () => {
      const invalidFile = {
        mimetype: "text/plain",
        originalname: "test.txt",
      } as Express.Multer.File;

      await expect(
        service.uploadPdf("terms-of-service", invalidFile),
      ).rejects.toThrow(BadRequestException);
    });

    it("should attach valid pdf, increment version, and record history", async () => {
      const validFile = {
        mimetype: "application/pdf",
        originalname: "terms.pdf",
        filename: "doc-123.pdf",
        path: "/tmp/doc-123.pdf",
        size: 2048,
      } as Express.Multer.File;

      mockDocumentRepository.findOneOrFail.mockResolvedValue({
        ...mockDocument,
      });
      mockDocumentRepository.save.mockImplementation((doc) =>
        Promise.resolve(doc),
      );
      mockHistoryRepository.create.mockReturnValue(mockHistory);
      mockHistoryRepository.save.mockResolvedValue(mockHistory);

      const result = await service.uploadPdf(
        "terms-of-service",
        validFile,
        { changeSummary: "Uploaded signed PDF" },
        mockUser,
      );

      expect(result.pdfOriginalName).toBe("terms.pdf");
      expect(result.version).toBe(2);
      expect(mockHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 2,
          pdfOriginalName: "terms.pdf",
        }),
      );
    });
  });

  describe("removePdf", () => {
    it("should throw if document has no pdf", async () => {
      const docNoPdf = new Document({ ...mockDocument, pdfPath: null });
      mockDocumentRepository.findOneOrFail.mockResolvedValue(docNoPdf);

      await expect(service.removePdf("terms-of-service")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should remove pdf and increment version", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue({
        ...mockDocument,
      });
      mockDocumentRepository.save.mockImplementation((doc) =>
        Promise.resolve(doc),
      );
      mockHistoryRepository.create.mockReturnValue(mockHistory);
      mockHistoryRepository.save.mockResolvedValue(mockHistory);

      const result = await service.removePdf("terms-of-service", mockUser);
      expect(result.pdfPath).toBeNull();
      expect(result.version).toBe(2);
    });
  });

  describe("getPdfFile", () => {
    it("should throw NotFoundException if document has no pdf", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(
        new Document({ ...mockDocument, pdfPath: null }),
      );

      await expect(service.getPdfFile("terms-of-service")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException if file is missing on storage", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      jest.spyOn(fs, "existsSync").mockReturnValue(false);

      await expect(service.getPdfFile("terms-of-service")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should return file metadata if file exists", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      jest.spyOn(fs, "existsSync").mockReturnValue(true);

      const result = await service.getPdfFile("terms-of-service");
      expect(result.originalName).toBe("terms.pdf");
      expect(result.mimeType).toBe("application/pdf");
    });
  });

  describe("getHistory & getHistoryVersion", () => {
    it("should return list of history items", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      mockHistoryRepository.find.mockResolvedValue([mockHistory]);

      const result = await service.getHistory("terms-of-service");
      expect(result).toEqual([mockHistory]);
    });

    it("should return specific history version", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      mockHistoryRepository.findOne.mockResolvedValue(mockHistory);

      const result = await service.getHistoryVersion("terms-of-service", 1);
      expect(result).toEqual(mockHistory);
    });

    it("should throw NotFoundException if version not found", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      mockHistoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getHistoryVersion("terms-of-service", 99),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getHistoryVersionPdf", () => {
    it("should throw NotFoundException if version has no attached PDF", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      mockHistoryRepository.findOne.mockResolvedValue(
        new DocumentHistory({ ...mockHistory, pdfPath: null }),
      );

      await expect(
        service.getHistoryVersionPdf("terms-of-service", 1),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if file does not exist on disk", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      mockHistoryRepository.findOne.mockResolvedValue(mockHistory);
      jest.spyOn(fs, "existsSync").mockReturnValue(false);

      await expect(
        service.getHistoryVersionPdf("terms-of-service", 1),
      ).rejects.toThrow(NotFoundException);
    });

    it("should return file metadata if version pdf exists", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      mockHistoryRepository.findOne.mockResolvedValue(mockHistory);
      jest.spyOn(fs, "existsSync").mockReturnValue(true);

      const result = await service.getHistoryVersionPdf("terms-of-service", 1);
      expect(result.originalName).toBe("terms.pdf");
      expect(result.mimeType).toBe("application/pdf");
    });
  });

  describe("revert", () => {
    it("should revert document to target version and bump version", async () => {
      const v1History = new DocumentHistory({
        ...mockHistory,
        version: 1,
        title: "V1 Title",
      });

      mockDocumentRepository.findOneOrFail.mockResolvedValue({
        ...mockDocument,
        version: 3,
        title: "V3 Title",
      });
      mockHistoryRepository.findOne.mockResolvedValue(v1History);
      mockDocumentRepository.save.mockImplementation((doc) =>
        Promise.resolve(doc),
      );
      mockHistoryRepository.create.mockReturnValue(mockHistory);
      mockHistoryRepository.save.mockResolvedValue(mockHistory);

      const result = await service.revert("terms-of-service", 1, mockUser);

      expect(result.title).toBe("V1 Title");
      expect(result.version).toBe(4);
      expect(mockHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 4,
          changeSummary: "Reverted to version 1",
        }),
      );
    });

    it("should throw NotFoundException if target version not found", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);
      mockHistoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.revert("terms-of-service", 99, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("diff", () => {
    it("should calculate diff between two versions", async () => {
      const v1 = new DocumentHistory({
        ...mockHistory,
        version: 1,
        title: "V1",
      });
      const v2 = new DocumentHistory({
        ...mockHistory,
        version: 2,
        title: "V2",
      });

      mockDocumentRepository.findOneOrFail.mockResolvedValue({
        ...mockDocument,
        version: 2,
      });
      mockHistoryRepository.findOne
        .mockResolvedValueOnce(v1)
        .mockResolvedValueOnce(v2);

      const result = await service.diff("terms-of-service", 1, 2);
      expect(result.changes.titleChanged).toBe(true);
      expect(result.changes.title).toEqual({ from: "V1", to: "V2" });
    });

    it("should infer default from and to versions if omitted", async () => {
      const v1 = new DocumentHistory({ ...mockHistory, version: 1 });
      const v2 = new DocumentHistory({ ...mockHistory, version: 2 });

      mockDocumentRepository.findOneOrFail.mockResolvedValue({
        ...mockDocument,
        version: 2,
      });
      mockHistoryRepository.findOne
        .mockResolvedValueOnce(v1)
        .mockResolvedValueOnce(v2);

      const result = await service.diff("terms-of-service");
      expect(result.fromVersion).toBe(1);
      expect(result.toVersion).toBe(2);
    });
  });

  describe("getMarkdown", () => {
    it("should render markdown for document", async () => {
      mockDocumentRepository.findOneOrFail.mockResolvedValue(mockDocument);

      const md = await service.getMarkdown("terms-of-service");
      expect(md).toContain("# Terms of Service");
      expect(md).toContain("## 1. Acceptance");
    });
  });
});
