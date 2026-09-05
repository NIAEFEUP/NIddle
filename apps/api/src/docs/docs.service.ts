import * as fs from "node:fs";
import * as path from "node:path";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateDocumentDto } from "@/docs/dto/create-document.dto";
import { CreateDocumentFromPdfDto } from "@/docs/dto/create-document-from-pdf.dto";
import { DocumentFilterDto } from "@/docs/dto/document-filter.dto";
import { UpdateDocumentDto } from "@/docs/dto/update-document.dto";
import { UploadPdfDto } from "@/docs/dto/upload-pdf.dto";
import { Document } from "@/docs/entities/document.entity";
import { DocumentHistory } from "@/docs/entities/document-history.entity";
import { documentToMarkdown } from "@/docs/utils/markdown.util";
import {
  filenameToTitle,
  isReservedSlug,
  slugify,
} from "@/docs/utils/slug.util";
import { User } from "@/users/entities/user.entity";

export const getDocumentsUploadDir = (): string => {
  return (
    process.env.DOCUMENTS_UPLOAD_DIR ||
    path.join(process.cwd(), "uploads", "documents")
  );
};

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentHistory)
    private readonly historyRepository: Repository<DocumentHistory>,
  ) {}

  async create(
    createDto: CreateDocumentDto,
    currentUser?: User,
  ): Promise<Document> {
    const rawSlug = createDto.slug
      ? slugify(createDto.slug)
      : slugify(createDto.title);
    if (!rawSlug) {
      throw new BadRequestException("Slug could not be generated from title.");
    }

    if (isReservedSlug(rawSlug)) {
      throw new BadRequestException(`Slug '${rawSlug}' is a reserved keyword.`);
    }

    const existing = await this.documentRepository.findOne({
      where: { slug: rawSlug },
    });
    if (existing) {
      throw new ConflictException(
        `A document with slug '${rawSlug}' already exists.`,
      );
    }

    const document = this.documentRepository.create({
      ...createDto,
      slug: rawSlug,
      version: 1,
      sections: createDto.sections || [],
      changeSummary: createDto.changeSummary || "Initial document creation",
      author: currentUser || null,
    });

    const savedDoc = await this.documentRepository.save(document);

    // Save initial revision to history
    const historyEntry = this.historyRepository.create({
      documentId: savedDoc.id,
      version: 1,
      title: savedDoc.title,
      subtitle: savedDoc.subtitle,
      description: savedDoc.description,
      sections: savedDoc.sections,
      pdfPath: savedDoc.pdfPath,
      pdfOriginalName: savedDoc.pdfOriginalName,
      pdfMimeType: savedDoc.pdfMimeType,
      pdfSize: savedDoc.pdfSize,
      changeSummary: savedDoc.changeSummary,
      author: currentUser || null,
      authorEmail: currentUser?.email || null,
      isPublished: savedDoc.isPublished,
      effectiveDate: savedDoc.effectiveDate,
    });
    await this.historyRepository.save(historyEntry);

    return savedDoc;
  }

  async createFromPdf(
    file: Express.Multer.File,
    dto: CreateDocumentFromPdfDto = {},
    currentUser?: User,
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException("No PDF file uploaded.");
    }

    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      if (file.path) {
        this.deleteFileSafely(file.path);
      }
      throw new BadRequestException("Uploaded file must be a valid PDF.");
    }

    const title = dto.title?.trim() || filenameToTitle(file.originalname);
    if (!title) {
      throw new BadRequestException("A valid title could not be determined.");
    }

    const rawSlug = dto.slug ? slugify(dto.slug) : slugify(title);
    if (!rawSlug) {
      throw new BadRequestException("Slug could not be generated from title.");
    }

    if (isReservedSlug(rawSlug)) {
      throw new BadRequestException(`Slug '${rawSlug}' is a reserved keyword.`);
    }

    const existing = await this.documentRepository.findOne({
      where: { slug: rawSlug },
    });
    if (existing) {
      throw new ConflictException(
        `A document with slug '${rawSlug}' already exists.`,
      );
    }

    const changeSummary =
      dto.changeSummary ||
      `Initial document submission via PDF upload: ${file.originalname}`;

    const document = this.documentRepository.create({
      title,
      subtitle: dto.subtitle || null,
      description: dto.description || null,
      slug: rawSlug,
      sections: [],
      pdfPath: file.filename || path.basename(file.path),
      pdfOriginalName: file.originalname,
      pdfMimeType: file.mimetype,
      pdfSize: file.size,
      version: 1,
      isPublished: dto.isPublished ?? true,
      effectiveDate: dto.effectiveDate || null,
      changeSummary,
      author: currentUser || null,
    });

    const savedDoc = await this.documentRepository.save(document);

    const historyEntry = this.historyRepository.create({
      documentId: savedDoc.id,
      version: 1,
      title: savedDoc.title,
      subtitle: savedDoc.subtitle,
      description: savedDoc.description,
      sections: [],
      pdfPath: savedDoc.pdfPath,
      pdfOriginalName: savedDoc.pdfOriginalName,
      pdfMimeType: savedDoc.pdfMimeType,
      pdfSize: savedDoc.pdfSize,
      changeSummary,
      author: currentUser || null,
      authorEmail: currentUser?.email || null,
      isPublished: savedDoc.isPublished,
      effectiveDate: savedDoc.effectiveDate,
    });
    await this.historyRepository.save(historyEntry);

    return savedDoc;
  }

  async findAll(
    filters: DocumentFilterDto,
    isAdmin = false,
  ): Promise<Document[]> {
    const { page = 1, limit = 10, search, isPublished } = filters;

    const query = this.documentRepository
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.author", "author")
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("document.createdAt", "DESC");

    if (!isAdmin) {
      query.andWhere("document.isPublished = :isPublished", {
        isPublished: true,
      });
    } else if (isPublished !== undefined) {
      query.andWhere("document.isPublished = :isPublished", { isPublished });
    }

    if (search?.trim()) {
      query.andWhere(
        "(LOWER(document.title) LIKE :search OR LOWER(document.subtitle) LIKE :search OR LOWER(document.slug) LIKE :search)",
        { search: `%${search.toLowerCase()}%` },
      );
    }

    return query.getMany();
  }

  async findOneBySlug(slug: string, isAdmin = false): Promise<Document> {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
      relations: ["author"],
    });

    if (!isAdmin && !document.isPublished) {
      throw new NotFoundException(`Document with slug '${slug}' not found.`);
    }

    return document;
  }

  async update(
    slug: string,
    updateDto: UpdateDocumentDto,
    currentUser?: User,
  ): Promise<Document> {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
      relations: ["author"],
    });

    if (updateDto.slug && updateDto.slug !== document.slug) {
      const targetSlug = slugify(updateDto.slug);
      if (isReservedSlug(targetSlug)) {
        throw new BadRequestException(
          `Slug '${targetSlug}' is a reserved keyword.`,
        );
      }
      const existing = await this.documentRepository.findOne({
        where: { slug: targetSlug },
      });
      if (existing) {
        throw new ConflictException(
          `A document with slug '${targetSlug}' already exists.`,
        );
      }
      document.slug = targetSlug;
    }

    const nextVersion = document.version + 1;
    const changeSummary =
      updateDto.changeSummary || `Updated to version ${nextVersion}`;

    if (updateDto.title !== undefined) document.title = updateDto.title;
    if (updateDto.subtitle !== undefined)
      document.subtitle = updateDto.subtitle;
    if (updateDto.description !== undefined)
      document.description = updateDto.description;
    if (updateDto.sections !== undefined)
      document.sections = updateDto.sections;
    if (updateDto.isPublished !== undefined)
      document.isPublished = updateDto.isPublished;
    if (updateDto.effectiveDate !== undefined)
      document.effectiveDate = updateDto.effectiveDate;

    document.version = nextVersion;
    document.changeSummary = changeSummary;
    if (currentUser) {
      document.author = currentUser;
    }

    const savedDoc = await this.documentRepository.save(document);

    // Save snapshot in history
    const historyEntry = this.historyRepository.create({
      documentId: savedDoc.id,
      version: savedDoc.version,
      title: savedDoc.title,
      subtitle: savedDoc.subtitle,
      description: savedDoc.description,
      sections: savedDoc.sections,
      pdfPath: savedDoc.pdfPath,
      pdfOriginalName: savedDoc.pdfOriginalName,
      pdfMimeType: savedDoc.pdfMimeType,
      pdfSize: savedDoc.pdfSize,
      changeSummary: changeSummary,
      author: currentUser || null,
      authorEmail: currentUser?.email || null,
      isPublished: savedDoc.isPublished,
      effectiveDate: savedDoc.effectiveDate,
    });
    await this.historyRepository.save(historyEntry);

    return savedDoc;
  }

  async remove(slug: string): Promise<Document> {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
    });

    // Delete stored PDF if present
    if (document.pdfPath) {
      this.deleteFileSafely(document.pdfPath);
    }

    await this.documentRepository.delete(document.id);
    return document;
  }

  async uploadPdf(
    slug: string,
    file: Express.Multer.File,
    uploadPdfDto?: UploadPdfDto,
    currentUser?: User,
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException("No PDF file uploaded.");
    }

    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      if (file.path) {
        this.deleteFileSafely(file.path);
      }
      throw new BadRequestException("Uploaded file must be a valid PDF.");
    }

    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
    });

    const nextVersion = document.version + 1;
    const changeSummary =
      uploadPdfDto?.changeSummary ||
      `Uploaded PDF representation: ${file.originalname}`;

    document.pdfPath = file.filename || path.basename(file.path);
    document.pdfOriginalName = file.originalname;
    document.pdfMimeType = file.mimetype;
    document.pdfSize = file.size;
    document.version = nextVersion;
    document.changeSummary = changeSummary;
    if (currentUser) {
      document.author = currentUser;
    }

    const savedDoc = await this.documentRepository.save(document);

    const historyEntry = this.historyRepository.create({
      documentId: savedDoc.id,
      version: savedDoc.version,
      title: savedDoc.title,
      subtitle: savedDoc.subtitle,
      description: savedDoc.description,
      sections: savedDoc.sections,
      pdfPath: savedDoc.pdfPath,
      pdfOriginalName: savedDoc.pdfOriginalName,
      pdfMimeType: savedDoc.pdfMimeType,
      pdfSize: savedDoc.pdfSize,
      changeSummary: changeSummary,
      author: currentUser || null,
      authorEmail: currentUser?.email || null,
      isPublished: savedDoc.isPublished,
      effectiveDate: savedDoc.effectiveDate,
    });
    await this.historyRepository.save(historyEntry);

    return savedDoc;
  }

  async removePdf(slug: string, currentUser?: User): Promise<Document> {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
    });

    if (!document.pdfPath) {
      throw new BadRequestException(
        "Document does not have an attached PDF to remove.",
      );
    }

    const nextVersion = document.version + 1;
    const changeSummary = "Removed PDF representation";

    document.pdfPath = null;
    document.pdfOriginalName = null;
    document.pdfMimeType = null;
    document.pdfSize = null;
    document.version = nextVersion;
    document.changeSummary = changeSummary;
    if (currentUser) {
      document.author = currentUser;
    }

    const savedDoc = await this.documentRepository.save(document);

    const historyEntry = this.historyRepository.create({
      documentId: savedDoc.id,
      version: savedDoc.version,
      title: savedDoc.title,
      subtitle: savedDoc.subtitle,
      description: savedDoc.description,
      sections: savedDoc.sections,
      pdfPath: null,
      pdfOriginalName: null,
      pdfMimeType: null,
      pdfSize: null,
      changeSummary: changeSummary,
      author: currentUser || null,
      authorEmail: currentUser?.email || null,
      isPublished: savedDoc.isPublished,
      effectiveDate: savedDoc.effectiveDate,
    });
    await this.historyRepository.save(historyEntry);

    return savedDoc;
  }

  async getPdfFile(
    slug: string,
  ): Promise<{ filePath: string; originalName: string; mimeType: string }> {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
    });

    if (!document.pdfPath) {
      throw new NotFoundException(
        `Document '${slug}' does not have an attached PDF.`,
      );
    }

    const filePath = path.resolve(getDocumentsUploadDir(), document.pdfPath);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException("PDF file not found on storage server.");
    }

    return {
      filePath,
      originalName: document.pdfOriginalName || `${slug}.pdf`,
      mimeType: document.pdfMimeType || "application/pdf",
    };
  }

  async getHistory(slug: string): Promise<DocumentHistory[]> {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
    });

    return this.historyRepository.find({
      where: { documentId: document.id },
      relations: ["author"],
      order: { version: "DESC" },
    });
  }

  async getHistoryVersion(
    slug: string,
    version: number,
  ): Promise<DocumentHistory> {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
    });

    const history = await this.historyRepository.findOne({
      where: { documentId: document.id, version },
      relations: ["author"],
    });

    if (!history) {
      throw new NotFoundException(
        `Version ${version} of document '${slug}' not found.`,
      );
    }

    return history;
  }

  async getHistoryVersionPdf(
    slug: string,
    version: number,
  ): Promise<{ filePath: string; originalName: string; mimeType: string }> {
    const history = await this.getHistoryVersion(slug, version);

    if (!history.pdfPath) {
      throw new NotFoundException(
        `Version ${version} of document '${slug}' does not have an attached PDF.`,
      );
    }

    const filePath = path.resolve(getDocumentsUploadDir(), history.pdfPath);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException("PDF file not found on storage server.");
    }

    return {
      filePath,
      originalName: history.pdfOriginalName || `${slug}-v${version}.pdf`,
      mimeType: history.pdfMimeType || "application/pdf",
    };
  }

  async revert(
    slug: string,
    targetVersion: number,
    currentUser?: User,
  ): Promise<Document> {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
    });

    const targetHistory = await this.historyRepository.findOne({
      where: { documentId: document.id, version: targetVersion },
    });

    if (!targetHistory) {
      throw new NotFoundException(
        `Target version ${targetVersion} not found for document '${slug}'.`,
      );
    }

    const nextVersion = document.version + 1;
    const changeSummary = `Reverted to version ${targetVersion}`;

    document.title = targetHistory.title;
    document.subtitle = targetHistory.subtitle;
    document.description = targetHistory.description;
    document.sections = targetHistory.sections;
    document.pdfPath = targetHistory.pdfPath;
    document.pdfOriginalName = targetHistory.pdfOriginalName;
    document.pdfMimeType = targetHistory.pdfMimeType;
    document.pdfSize = targetHistory.pdfSize;
    document.effectiveDate = targetHistory.effectiveDate;
    document.isPublished = targetHistory.isPublished;
    document.version = nextVersion;
    document.changeSummary = changeSummary;
    if (currentUser) {
      document.author = currentUser;
    }

    const savedDoc = await this.documentRepository.save(document);

    const historyEntry = this.historyRepository.create({
      documentId: savedDoc.id,
      version: savedDoc.version,
      title: savedDoc.title,
      subtitle: savedDoc.subtitle,
      description: savedDoc.description,
      sections: savedDoc.sections,
      pdfPath: savedDoc.pdfPath,
      pdfOriginalName: savedDoc.pdfOriginalName,
      pdfMimeType: savedDoc.pdfMimeType,
      pdfSize: savedDoc.pdfSize,
      changeSummary: changeSummary,
      author: currentUser || null,
      authorEmail: currentUser?.email || null,
      isPublished: savedDoc.isPublished,
      effectiveDate: savedDoc.effectiveDate,
    });
    await this.historyRepository.save(historyEntry);

    return savedDoc;
  }

  async diff(slug: string, fromVersion?: number, toVersion?: number) {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
    });

    const targetTo = toVersion ?? document.version;
    const targetFrom = fromVersion ?? Math.max(1, targetTo - 1);

    const [vFrom, vTo] = await Promise.all([
      this.getHistoryVersion(slug, targetFrom),
      this.getHistoryVersion(slug, targetTo),
    ]);

    const titleChanged = vFrom.title !== vTo.title;
    const subtitleChanged = vFrom.subtitle !== vTo.subtitle;
    const descriptionChanged = vFrom.description !== vTo.description;
    const pdfChanged = vFrom.pdfPath !== vTo.pdfPath;
    const sectionsFromStr = JSON.stringify(vFrom.sections || []);
    const sectionsToStr = JSON.stringify(vTo.sections || []);
    const sectionsChanged = sectionsFromStr !== sectionsToStr;

    return {
      slug,
      fromVersion: targetFrom,
      toVersion: targetTo,
      changes: {
        titleChanged,
        title: { from: vFrom.title, to: vTo.title },
        subtitleChanged,
        subtitle: { from: vFrom.subtitle, to: vTo.subtitle },
        descriptionChanged,
        pdfChanged,
        pdf: { from: vFrom.pdfOriginalName, to: vTo.pdfOriginalName },
        sectionsChanged,
        sectionsCount: {
          from: vFrom.sections?.length || 0,
          to: vTo.sections?.length || 0,
        },
      },
    };
  }

  async getMarkdown(slug: string): Promise<string> {
    const document = await this.documentRepository.findOneOrFail({
      where: { slug },
    });

    return documentToMarkdown(document);
  }

  private deleteFileSafely(filePathOrName: string) {
    try {
      const fullPath = path.isAbsolute(filePathOrName)
        ? filePathOrName
        : path.resolve(getDocumentsUploadDir(), filePathOrName);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch {
      // Ignored if file deletion fails
    }
  }
}
