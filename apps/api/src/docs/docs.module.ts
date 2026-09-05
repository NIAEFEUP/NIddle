import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocsController } from "@/docs/docs.controller";
import { DocsService } from "@/docs/docs.service";
import { Document } from "@/docs/entities/document.entity";
import { DocumentHistory } from "@/docs/entities/document-history.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentHistory])],
  controllers: [DocsController],
  providers: [DocsService],
  exports: [DocsService],
})
export class DocsModule {}
