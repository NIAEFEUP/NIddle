import { DocumentHistory } from "@/docs/entities/document-history.entity";
import { User } from "@/users/entities/user.entity";

describe("DocumentHistory Entity", () => {
  it("should create document history instance with partial properties", () => {
    const user = new User({ id: "user-uuid", email: "admin@example.com" });
    const history = new DocumentHistory({
      id: "hist-uuid",
      documentId: "doc-uuid",
      version: 1,
      title: "Privacy Policy",
      changeSummary: "Initial version",
      author: user,
      authorEmail: "admin@example.com",
    });

    expect(history.id).toBe("hist-uuid");
    expect(history.documentId).toBe("doc-uuid");
    expect(history.version).toBe(1);
    expect(history.title).toBe("Privacy Policy");
    expect(history.changeSummary).toBe("Initial version");
    expect(history.author).toBe(user);
    expect(history.authorEmail).toBe("admin@example.com");
  });
});
