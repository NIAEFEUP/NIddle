import {
  filenameToTitle,
  isReservedSlug,
  slugify,
} from "@/docs/utils/slug.util";

describe("slug.util", () => {
  describe("slugify", () => {
    it("converts simple string to slug", () => {
      expect(slugify("Terms of Service")).toBe("terms-of-service");
    });

    it("handles accented characters", () => {
      expect(slugify("Termos de Utilização & Políticas")).toBe(
        "termos-de-utilizacao-politicas",
      );
    });

    it("strips punctuation and special characters", () => {
      expect(slugify("Privacy Policy (v2.0) - Important!")).toBe(
        "privacy-policy-v20-important",
      );
    });

    it("collapses multiple dashes and spaces", () => {
      expect(slugify("  Doc   ---   Title  ")).toBe("doc-title");
    });
  });

  describe("isReservedSlug", () => {
    it("returns true for reserved slugs", () => {
      expect(isReservedSlug("swagger")).toBe(true);
      expect(isReservedSlug("history")).toBe(true);
      expect(isReservedSlug("diff")).toBe(true);
      expect(isReservedSlug("pdf")).toBe(true);
      expect(isReservedSlug("markdown")).toBe(true);
      expect(isReservedSlug("from-pdf")).toBe(true);
    });

    it("is case-insensitive", () => {
      expect(isReservedSlug("SWAGGER")).toBe(true);
      expect(isReservedSlug("PDF")).toBe(true);
    });

    it("returns false for regular slugs", () => {
      expect(isReservedSlug("terms-of-service")).toBe(false);
      expect(isReservedSlug("privacy-policy")).toBe(false);
    });
  });

  describe("filenameToTitle", () => {
    it("converts filenames with dashes and underscores into formatted title", () => {
      expect(filenameToTitle("terms-of-service-2026.pdf")).toBe(
        "Terms Of Service 2026",
      );
      expect(filenameToTitle("privacy_policy.pdf")).toBe("Privacy Policy");
    });
  });
});
