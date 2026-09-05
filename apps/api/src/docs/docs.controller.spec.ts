import * as fs from "node:fs";
import { Readable } from "node:stream";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { NextFunction, Request, Response } from "express";
import { DocsController, pdfMulterOptions } from "@/docs/docs.controller";
import { DocsService } from "@/docs/docs.service";
import { DocumentFilterDto } from "@/docs/dto/document-filter.dto";
import { Document } from "@/docs/entities/document.entity";
import { DocumentHistory } from "@/docs/entities/document-history.entity";
import { User } from "@/users/entities/user.entity";

describe("DocsController", () => {
  let controller: DocsController;
  let service: Record<string, jest.Mock>;

  const mockUser = new User({
    id: "user-1",
    email: "admin@example.com",
    isAdmin: true,
  });

  const mockDocument: Document = new Document({
    id: "doc-1",
    slug: "terms-of-service",
    title: "Terms of Service",
    version: 1,
    isPublished: true,
    sections: [],
  });

  const mockHistory = new DocumentHistory({
    id: "hist-1",
    documentId: "doc-1",
    version: 1,
    title: "Terms of Service",
  });

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      create: jest.fn(),
      createFromPdf: jest.fn(),
      findOneBySlug: jest.fn(),
      getMarkdown: jest.fn(),
      getPdfFile: jest.fn(),
      getHistory: jest.fn(),
      getHistoryVersion: jest.fn(),
      getHistoryVersionPdf: jest.fn(),
      diff: jest.fn(),
      update: jest.fn(),
      uploadPdf: jest.fn(),
      removePdf: jest.fn(),
      revert: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocsController],
      providers: [
        {
          provide: DocsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<DocsController>(DocsController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll & listAll", () => {
    it("should pass through to next middleware if html is requested (Swagger UI)", async () => {
      const req = {
        headers: { accept: "text/html" },
      } as unknown as Request & { user?: User };
      const res = {} as Response;
      const next: NextFunction = jest.fn();

      await controller.findAll(new DocumentFilterDto(), req, res, next);
      expect(next).toHaveBeenCalled();
      expect(service.findAll).not.toHaveBeenCalled();
    });

    it("should return documents if json is requested", async () => {
      const req = {
        headers: { accept: "application/json" },
        user: mockUser,
      } as unknown as Request & { user?: User };
      const res = {
        json: jest.fn().mockImplementation((data) => data),
      } as unknown as Response;
      const next: NextFunction = jest.fn();

      service.findAll.mockResolvedValue([mockDocument]);

      await controller.findAll(new DocumentFilterDto(), req, res, next);
      expect(service.findAll).toHaveBeenCalledWith(expect.any(Object), true);
      expect(res.json).toHaveBeenCalledWith([mockDocument]);
    });

    it("listAll should return list of documents directly", async () => {
      const req = { user: mockUser } as unknown as Request & { user?: User };
      service.findAll.mockResolvedValue([mockDocument]);

      const result = await controller.listAll(new DocumentFilterDto(), req);
      expect(service.findAll).toHaveBeenCalledWith(expect.any(Object), true);
      expect(result).toEqual([mockDocument]);
    });
  });

  describe("create & createFromPdf", () => {
    it("creates a document from json", async () => {
      service.create.mockResolvedValue(mockDocument);

      const result = await controller.create(
        { title: "Terms of Service" },
        { user: mockUser },
      );

      expect(service.create).toHaveBeenCalledWith(
        { title: "Terms of Service" },
        mockUser,
      );
      expect(result).toBe(mockDocument);
    });

    it("creates a document by uploading a PDF", async () => {
      const mockFile = {} as Express.Multer.File;
      service.createFromPdf.mockResolvedValue(mockDocument);

      const result = await controller.createFromPdf(
        mockFile,
        { title: "Uploaded Policy" },
        { user: mockUser },
      );

      expect(service.createFromPdf).toHaveBeenCalledWith(
        mockFile,
        { title: "Uploaded Policy" },
        mockUser,
      );
      expect(result).toBe(mockDocument);
    });

    it("creates a document via alias from-pdf", async () => {
      const mockFile = {} as Express.Multer.File;
      service.createFromPdf.mockResolvedValue(mockDocument);

      const result = await controller.createFromPdfAlias(
        mockFile,
        {},
        { user: mockUser },
      );

      expect(service.createFromPdf).toHaveBeenCalledWith(
        mockFile,
        {},
        mockUser,
      );
      expect(result).toBe(mockDocument);
    });
  });

  describe("findOne", () => {
    it("calls next if slug contains dot (swagger static file)", async () => {
      const req = {} as unknown as Request & { user?: User };
      const res = {} as Response;
      const next: NextFunction = jest.fn();

      await controller.findOne("swagger-ui.css", req, res, next);
      expect(next).toHaveBeenCalled();
      expect(service.findOneBySlug).not.toHaveBeenCalled();
    });

    it("returns document if valid slug", async () => {
      const req = { user: mockUser } as unknown as Request & { user?: User };
      const res = {
        json: jest.fn().mockImplementation((data) => data),
      } as unknown as Response;
      const next: NextFunction = jest.fn();

      service.findOneBySlug.mockResolvedValue(mockDocument);

      await controller.findOne("terms-of-service", req, res, next);
      expect(service.findOneBySlug).toHaveBeenCalledWith(
        "terms-of-service",
        true,
      );
      expect(res.json).toHaveBeenCalledWith(mockDocument);
    });
  });

  describe("getMarkdown", () => {
    it("returns markdown content with appropriate header", async () => {
      const res = {
        setHeader: jest.fn(),
        send: jest.fn().mockImplementation((data) => data),
      } as unknown as Response;

      service.getMarkdown.mockResolvedValue("# Terms of Service");

      await controller.getMarkdown("terms-of-service", res);

      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/markdown; charset=utf-8",
      );
      expect(res.send).toHaveBeenCalledWith("# Terms of Service");
    });
  });

  describe("downloadPdf", () => {
    it("pipes pdf stream with download headers", async () => {
      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;

      service.getPdfFile.mockResolvedValue({
        filePath: "/tmp/dummy.pdf",
        originalName: "terms.pdf",
        mimeType: "application/pdf",
      });

      const mockStream = new Readable({
        read() {
          this.push(null);
        },
      });
      jest.spyOn(fs, "createReadStream").mockReturnValue(mockStream as any);
      jest.spyOn(mockStream, "pipe").mockReturnValue(res as any);

      await controller.downloadPdf("terms-of-service", res);

      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/pdf",
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        'inline; filename="terms.pdf"',
      );
    });
  });

  describe("history endpoints", () => {
    it("gets history list", async () => {
      service.getHistory.mockResolvedValue([mockHistory]);

      const result = await controller.getHistory("terms-of-service");
      expect(result).toEqual([mockHistory]);
      expect(service.getHistory).toHaveBeenCalledWith("terms-of-service");
    });

    it("gets specific history version", async () => {
      service.getHistoryVersion.mockResolvedValue(mockHistory);

      const result = await controller.getHistoryVersion("terms-of-service", 1);
      expect(result).toBe(mockHistory);
      expect(service.getHistoryVersion).toHaveBeenCalledWith(
        "terms-of-service",
        1,
      );
    });

    it("downloads history version pdf", async () => {
      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;

      service.getHistoryVersionPdf.mockResolvedValue({
        filePath: "/tmp/dummy.pdf",
        originalName: "terms-v1.pdf",
        mimeType: "application/pdf",
      });

      const mockStream = new Readable({
        read() {
          this.push(null);
        },
      });
      jest.spyOn(fs, "createReadStream").mockReturnValue(mockStream as any);
      jest.spyOn(mockStream, "pipe").mockReturnValue(res as any);

      await controller.downloadHistoryVersionPdf("terms-of-service", 1, res);
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/pdf",
      );
    });

    it("gets diff between versions", async () => {
      service.diff.mockResolvedValue({ changes: {} });

      const result = await controller.diff("terms-of-service", {
        from: 1,
        to: 2,
      });
      expect(result).toEqual({ changes: {} });
      expect(service.diff).toHaveBeenCalledWith("terms-of-service", 1, 2);
    });
  });

  describe("mutations", () => {
    it("updates document", async () => {
      service.update.mockResolvedValue(mockDocument);

      const result = await controller.update(
        "terms-of-service",
        { title: "New Title" },
        { user: mockUser },
      );

      expect(service.update).toHaveBeenCalledWith(
        "terms-of-service",
        { title: "New Title" },
        mockUser,
      );
      expect(result).toBe(mockDocument);
    });

    it("uploads pdf", async () => {
      const mockFile = {} as Express.Multer.File;
      service.uploadPdf.mockResolvedValue(mockDocument);

      const result = await controller.uploadPdf(
        "terms-of-service",
        mockFile,
        { changeSummary: "PDF upload" },
        { user: mockUser },
      );

      expect(service.uploadPdf).toHaveBeenCalledWith(
        "terms-of-service",
        mockFile,
        { changeSummary: "PDF upload" },
        mockUser,
      );
      expect(result).toBe(mockDocument);
    });

    it("removes pdf", async () => {
      service.removePdf.mockResolvedValue(mockDocument);

      const result = await controller.removePdf("terms-of-service", {
        user: mockUser,
      });

      expect(service.removePdf).toHaveBeenCalledWith(
        "terms-of-service",
        mockUser,
      );
      expect(result).toBe(mockDocument);
    });

    it("reverts document", async () => {
      service.revert.mockResolvedValue(mockDocument);

      const result = await controller.revert("terms-of-service", 1, {
        user: mockUser,
      });

      expect(service.revert).toHaveBeenCalledWith(
        "terms-of-service",
        1,
        mockUser,
      );
      expect(result).toBe(mockDocument);
    });

    it("removes document", async () => {
      service.remove.mockResolvedValue(mockDocument);

      const result = await controller.remove("terms-of-service");
      expect(service.remove).toHaveBeenCalledWith("terms-of-service");
      expect(result).toBe(mockDocument);
    });
  });

  describe("pdfMulterOptions", () => {
    it("fileFilter accepts pdf files", () => {
      const cb = jest.fn();
      const file = {
        mimetype: "application/pdf",
        originalname: "legal.pdf",
      } as Express.Multer.File;

      (pdfMulterOptions.fileFilter as any)({}, file, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it("fileFilter rejects non-pdf files", () => {
      const cb = jest.fn();
      const file = {
        mimetype: "text/plain",
        originalname: "legal.txt",
      } as Express.Multer.File;

      (pdfMulterOptions.fileFilter as any)({}, file, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it("storage destination creates directory and calls cb", () => {
      const cb = jest.fn();
      const file = {} as Express.Multer.File;
      jest.spyOn(fs, "mkdirSync").mockImplementation(() => undefined as any);

      (pdfMulterOptions.storage as any).getDestination({}, file, cb);
      expect(cb).toHaveBeenCalledWith(null, expect.any(String));
    });

    it("storage filename generates unique name", () => {
      const cb = jest.fn();
      const file = { originalname: "policy.pdf" } as Express.Multer.File;

      (pdfMulterOptions.storage as any).getFilename({}, file, cb);
      expect(cb).toHaveBeenCalledWith(
        null,
        expect.stringMatching(/^doc-.*\.pdf$/),
      );
    });
  });
});
