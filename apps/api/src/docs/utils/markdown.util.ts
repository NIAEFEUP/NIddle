export interface SectionLike {
  title: string;
  content?: string | null;
  order?: number | null;
  sections?: SectionLike[] | null;
}

export interface DocumentLike {
  title: string;
  subtitle?: string | null;
  sections?: SectionLike[] | null;
}

export function renderSectionsToMarkdown(
  sections: SectionLike[] = [],
  depth = 2,
): string {
  const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const parts: string[] = [];

  const headingLevel = Math.min(Math.max(depth, 1), 6);
  const hashes = "#".repeat(headingLevel);

  for (const section of sorted) {
    let sectionMd = `${hashes} ${section.title}`;
    if (section.content?.trim()) {
      sectionMd += `\n\n${section.content.trim()}`;
    }

    if (section.sections && section.sections.length > 0) {
      const nestedMd = renderSectionsToMarkdown(
        section.sections,
        headingLevel + 1,
      );
      if (nestedMd) {
        sectionMd += `\n\n${nestedMd}`;
      }
    }

    parts.push(sectionMd);
  }

  return parts.join("\n\n");
}

export function documentToMarkdown(doc: DocumentLike): string {
  const parts: string[] = [];

  if (doc.title) {
    parts.push(`# ${doc.title.trim()}`);
  }

  if (doc.subtitle?.trim()) {
    parts.push(`> ${doc.subtitle.trim()}`);
  }

  if (doc.sections && doc.sections.length > 0) {
    const sectionsMd = renderSectionsToMarkdown(doc.sections, 2);
    if (sectionsMd) {
      parts.push(sectionsMd);
    }
  }

  return `${parts.join("\n\n")}\n`;
}
