import * as fs from "node:fs";
import * as path from "node:path";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Next,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";
import * as multer from "multer";
import { AdminOnlyGuard } from "@/auth/guards/admin-only.guard";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { DocsService, getDocumentsUploadDir } from "@/docs/docs.service";
import { CreateDocumentDto } from "@/docs/dto/create-document.dto";
import { CreateDocumentFromPdfDto } from "@/docs/dto/create-document-from-pdf.dto";
import { DiffQueryDto } from "@/docs/dto/diff-query.dto";
import { DocumentFilterDto } from "@/docs/dto/document-filter.dto";
import { UpdateDocumentDto } from "@/docs/dto/update-document.dto";
import { UploadPdfDto } from "@/docs/dto/upload-pdf.dto";
import { Document } from "@/docs/entities/document.entity";
import { DocumentHistory } from "@/docs/entities/document-history.entity";
import { User } from "@/users/entities/user.entity";

export const pdfMulterOptions: multer.Options = {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = getDocumentsUploadDir();
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
      cb(null, `doc-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return cb(new BadRequestException("Only PDF files are allowed."));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
};

@ApiTags("docs")
@Controller("docs")
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @ApiOperation({ summary: "Get all legal documents" })
  @ApiResponse({ status: 200, description: "List of documents returned." })
  @Get()
  async findAll(
    @Query() filters: DocumentFilterDto,
    @Req() req: Request & { user?: User },
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    if (req.headers.accept?.includes("text/html")) {
      return next();
    }
    const isAdmin = Boolean(req.user?.isAdmin);
    const documents = await this.docsService.findAll(filters, isAdmin);
    return res.json(documents);
  }

  @ApiOperation({ summary: "Get all legal documents list (alias)" })
  @ApiResponse({ status: 200, description: "List of documents returned." })
  @Get("list/all")
  async listAll(
    @Query() filters: DocumentFilterDto,
    @Req() req: Request & { user?: User },
  ) {
    const isAdmin = Boolean(req.user?.isAdmin);
    return this.docsService.findAll(filters, isAdmin);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Create a new legal document (Admin only)" })
  @ApiResponse({ status: 201, description: "Document created." })
  @ApiResponse({ status: 400, description: "Bad request." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 409, description: "Conflict - slug already exists." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post()
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: { user?: User },
  ): Promise<Document> {
    return this.docsService.create(createDocumentDto, req.user);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary:
      "Create a new legal document directly by uploading a PDF file (Admin only)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "PDF file of the legal document",
        },
        title: {
          type: "string",
          description: "Optional title. If omitted, derived from filename.",
        },
        subtitle: {
          type: "string",
          description: "Optional subtitle or preamble",
        },
        slug: {
          type: "string",
          description: "Optional custom URL slug",
        },
        description: {
          type: "string",
          description: "Optional summary",
        },
        changeSummary: {
          type: "string",
          description: "Audit change summary for this initial PDF revision",
        },
        isPublished: {
          type: "boolean",
          description: "Whether the document is published immediately",
          default: true,
        },
        effectiveDate: {
          type: "string",
          format: "date-time",
          description: "Effective date of document",
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Document created from PDF." })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid PDF or slug.",
  })
  @ApiResponse({ status: 409, description: "Conflict - slug already exists." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @UseInterceptors(FileInterceptor("file", pdfMulterOptions))
  @Post("upload")
  createFromPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentFromPdfDto,
    @Req() req: { user?: User },
  ): Promise<Document> {
    return this.docsService.createFromPdf(file, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @UseInterceptors(FileInterceptor("file", pdfMulterOptions))
  @Post("from-pdf")
  createFromPdfAlias(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentFromPdfDto,
    @Req() req: { user?: User },
  ): Promise<Document> {
    return this.docsService.createFromPdf(file, dto, req.user);
  }

  @ApiOperation({ summary: "Get document by slug" })
  @ApiResponse({ status: 200, description: "Document found." })
  @ApiResponse({ status: 204, description: "Document not found." })
  @Get(":slug")
  async findOne(
    @Param("slug") slug: string,
    @Req() req: Request & { user?: User },
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    if (slug.includes(".") || slug.startsWith("swagger")) {
      return next();
    }
    const isAdmin = Boolean(req.user?.isAdmin);
    const document = await this.docsService.findOneBySlug(slug, isAdmin);
    return res.json(document);
  }

  @ApiOperation({ summary: "Get document rendered as Markdown" })
  @ApiResponse({
    status: 200,
    description: "Document rendered as Markdown text.",
  })
  @Get(":slug/markdown")
  async getMarkdown(@Param("slug") slug: string, @Res() res: Response) {
    const md = await this.docsService.getMarkdown(slug);
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    return res.send(md);
  }

  @ApiOperation({ summary: "Download/view PDF representation of document" })
  @ApiResponse({ status: 200, description: "PDF file stream." })
  @ApiResponse({ status: 404, description: "PDF not found." })
  @Get(":slug/pdf")
  async downloadPdf(@Param("slug") slug: string, @Res() res: Response) {
    const { filePath, originalName, mimeType } =
      await this.docsService.getPdfFile(slug);

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(originalName)}"`,
    );
    res.setHeader("Content-Type", mimeType);
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  }

  @ApiOperation({
    summary: "Get full historical audit trail of document revisions",
  })
  @ApiResponse({
    status: 200,
    description: "List of historical revisions returned.",
  })
  @Get(":slug/history")
  getHistory(@Param("slug") slug: string): Promise<DocumentHistory[]> {
    return this.docsService.getHistory(slug);
  }

  @ApiOperation({ summary: "Get a specific historical version of a document" })
  @ApiResponse({ status: 200, description: "Historical snapshot found." })
  @ApiResponse({ status: 404, description: "Version not found." })
  @Get(":slug/history/:version")
  getHistoryVersion(
    @Param("slug") slug: string,
    @Param("version", ParseIntPipe) version: number,
  ): Promise<DocumentHistory> {
    return this.docsService.getHistoryVersion(slug, version);
  }

  @ApiOperation({ summary: "Download PDF of a specific historical version" })
  @ApiResponse({ status: 200, description: "Historical PDF file stream." })
  @ApiResponse({ status: 404, description: "Version PDF not found." })
  @Get(":slug/history/:version/pdf")
  async downloadHistoryVersionPdf(
    @Param("slug") slug: string,
    @Param("version", ParseIntPipe) version: number,
    @Res() res: Response,
  ) {
    const { filePath, originalName, mimeType } =
      await this.docsService.getHistoryVersionPdf(slug, version);

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(originalName)}"`,
    );
    res.setHeader("Content-Type", mimeType);
    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  }

  @ApiOperation({ summary: "Compare diff between two versions of a document" })
  @ApiResponse({ status: 200, description: "Version diff returned." })
  @Get(":slug/diff")
  diff(@Param("slug") slug: string, @Query() query: DiffQueryDto) {
    return this.docsService.diff(slug, query.from, query.to);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update a legal document (Admin only)" })
  @ApiResponse({ status: 200, description: "Document updated." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 404, description: "Document not found." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Patch(":slug")
  update(
    @Param("slug") slug: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Req() req: { user?: User },
  ): Promise<Document> {
    return this.docsService.update(slug, updateDocumentDto, req.user);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Upload a PDF representation for the document (Admin only)",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "PDF file",
        },
        changeSummary: {
          type: "string",
          description: "Optional audit reason for upload",
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: "PDF uploaded successfully." })
  @ApiResponse({ status: 400, description: "Bad request - not a valid PDF." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @UseInterceptors(FileInterceptor("file", pdfMulterOptions))
  @Post(":slug/pdf")
  uploadPdf(
    @Param("slug") slug: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadPdfDto: UploadPdfDto,
    @Req() req: { user?: User },
  ): Promise<Document> {
    return this.docsService.uploadPdf(slug, file, uploadPdfDto, req.user);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Remove the PDF representation from a document (Admin only)",
  })
  @ApiResponse({ status: 200, description: "PDF removed." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":slug/pdf")
  removePdf(
    @Param("slug") slug: string,
    @Req() req: { user?: User },
  ): Promise<Document> {
    return this.docsService.removePdf(slug, req.user);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Revert document to a previous historical version (Admin only)",
  })
  @ApiResponse({
    status: 200,
    description: "Document reverted and new version created.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 404, description: "Version not found." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post(":slug/revert/:version")
  revert(
    @Param("slug") slug: string,
    @Param("version", ParseIntPipe) version: number,
    @Req() req: { user?: User },
  ): Promise<Document> {
    return this.docsService.revert(slug, version, req.user);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete a legal document (Admin only)" })
  @ApiResponse({ status: 200, description: "Document deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 404, description: "Document not found." })
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":slug")
  remove(@Param("slug") slug: string): Promise<Document> {
    return this.docsService.remove(slug);
  }
}
