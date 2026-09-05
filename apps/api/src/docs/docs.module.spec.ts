import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DocsController } from "@/docs/docs.controller";
import { DocsModule } from "@/docs/docs.module";
import { DocsService } from "@/docs/docs.service";
import { Document } from "@/docs/entities/document.entity";
import { DocumentHistory } from "@/docs/entities/document-history.entity";

describe("DocsModule", () => {
  it("should compile the module", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DocsModule],
    })
      .overrideProvider(getRepositoryToken(Document))
      .useValue({})
      .overrideProvider(getRepositoryToken(DocumentHistory))
      .useValue({})
      .compile();

    expect(module).toBeDefined();
    expect(module.get(DocsController)).toBeDefined();
    expect(module.get(DocsService)).toBeDefined();
  });
});
