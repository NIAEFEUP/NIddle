import {
  documentToMarkdown,
  renderSectionsToMarkdown,
} from "@/docs/utils/markdown.util";

describe("markdown.util", () => {
  it("renders a document with title, subtitle, and sections", () => {
    const doc = {
      title: "Terms of Service",
      subtitle: "Effective September 2026",
      sections: [
        {
          title: "1. Acceptance",
          content: "You agree to **all terms**.",
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
    };

    const md = documentToMarkdown(doc);
    expect(md).toContain("# Terms of Service");
    expect(md).toContain("> Effective September 2026");
    expect(md).toContain("## 1. Acceptance");
    expect(md).toContain("You agree to **all terms**.");
    expect(md).toContain("### 1.1 Eligibility");
    expect(md).toContain("Must be a student.");
  });

  it("handles document without subtitle or sections", () => {
    const doc = {
      title: "Simple Doc",
    };
    const md = documentToMarkdown(doc);
    expect(md.trim()).toBe("# Simple Doc");
  });

  it("sorts sections by order", () => {
    const sections = [
      { title: "Section B", order: 2, content: "B" },
      { title: "Section A", order: 1, content: "A" },
    ];
    const md = renderSectionsToMarkdown(sections);
    const indexA = md.indexOf("Section A");
    const indexB = md.indexOf("Section B");
    expect(indexA).toBeLessThan(indexB);
  });
});
