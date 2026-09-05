import { Document } from "@/docs/entities/document.entity";
import { User } from "@/users/entities/user.entity";

describe("Document Entity", () => {
  it("should create document instance with partial properties", () => {
    const user = new User({ id: "user-uuid", email: "admin@example.com" });
    const doc = new Document({
      id: "doc-uuid",
      slug: "terms-of-service",
      title: "Terms of Service",
      subtitle: "Effective 2026",
      version: 1,
      isPublished: true,
      author: user,
      sections: [
        {
          title: "Section 1",
          content: "Content with **bold** text",
        },
      ],
    });

    expect(doc.id).toBe("doc-uuid");
    expect(doc.slug).toBe("terms-of-service");
    expect(doc.title).toBe("Terms of Service");
    expect(doc.subtitle).toBe("Effective 2026");
    expect(doc.version).toBe(1);
    expect(doc.isPublished).toBe(true);
    expect(doc.author).toBe(user);
    expect(doc.sections).toHaveLength(1);
  });
});
