import { ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";
import { I18nService } from "@/i18n/i18n.service";
import { TranslationInterceptor } from "./translation.interceptor";

const createMockRequest = (headers: Record<string, string> = {}) => ({
  headers,
  i18nLanguage: undefined as string | undefined,
});

describe("TranslationInterceptor", () => {
  let interceptor: TranslationInterceptor;
  let i18nService: I18nService;
  let mockContext: ExecutionContext;
  let mockRequest: { headers: Record<string, string>; i18nLanguage?: string };

  beforeEach(() => {
    i18nService = new I18nService();
    interceptor = new TranslationInterceptor(i18nService);

    mockRequest = createMockRequest();
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  });

  describe("extractLanguage", () => {
    it("should return en for undefined", () => {
      const result = interceptor.intercept(mockContext, {
        handle: () => of({}),
      } as any);
      expect(result).toBeDefined();
    });

    it("should return en when accept-language is not provided", () => {
      mockRequest = createMockRequest({});
      interceptor.intercept(mockContext, {
        handle: () => of({}),
      } as any);
      expect(mockRequest.i18nLanguage).toBe("en");
    });

    it("should return en when accept-language is empty", () => {
      mockRequest = createMockRequest({ "accept-language": "" });
      interceptor.intercept(mockContext, {
        handle: () => of({}),
      } as any);
      expect(mockRequest.i18nLanguage).toBe("en");
    });

    it("should return pt when accept-language is pt", () => {
      mockRequest = createMockRequest({ "accept-language": "pt" });
      interceptor.intercept(mockContext, {
        handle: () => of({}),
      } as any);
      expect(mockRequest.i18nLanguage).toBe("pt");
    });

    it("should return pt when accept-language has pt-BR", () => {
      mockRequest = createMockRequest({ "accept-language": "pt-BR" });
      interceptor.intercept(mockContext, {
        handle: () => of({}),
      } as any);
      expect(mockRequest.i18nLanguage).toBe("pt");
    });

    it("should return en for unsupported language", () => {
      mockRequest = createMockRequest({ "accept-language": "fr" });
      interceptor.intercept(mockContext, {
        handle: () => of({}),
      } as any);
      expect(mockRequest.i18nLanguage).toBe("en");
    });

    it("should handle accept-language with quality value", () => {
      mockRequest = createMockRequest({
        "accept-language": "pt;q=0.9, en;q=0.8",
      });
      interceptor.intercept(mockContext, {
        handle: () => of({}),
      } as any);
      expect(mockRequest.i18nLanguage).toBe("pt");
    });

    it("should process response through pipe", async () => {
      const mockData = {
        translations: [{ languageCode: "en", name: "Test" }],
      };

      let result: any;
      interceptor
        .intercept(mockContext, {
          handle: () => of(mockData),
        } as any)
        .subscribe((data) => {
          result = data;
        });

      expect(result).toBeDefined();
      expect(result.name).toBe("Test");
    });
  });

  describe("transformResponse", () => {
    it("should return data as is if null", () => {
      const result = (interceptor as any).transformResponse(null, "en");
      expect(result).toBeNull();
    });

    it("should return data as is if not object", () => {
      const result = (interceptor as any).transformResponse("string", "en");
      expect(result).toBe("string");
    });

    it("should transform array of items", () => {
      const data = [
        {
          translations: [{ languageCode: "en", name: "Test", acronym: "T" }],
        },
      ];
      const result = (interceptor as any).transformResponse(data, "en");
      expect(result[0].name).toBe("Test");
      expect(result[0].translations).toBeUndefined();
    });

    it("should transform single item", () => {
      const data = {
        translations: [{ languageCode: "en", name: "Test", acronym: "T" }],
      };
      const result = (interceptor as any).transformResponse(data, "en");
      expect(result.name).toBe("Test");
      expect(result.translations).toBeUndefined();
    });

    it("should fallback to en if requested language not available", () => {
      const data = {
        translations: [{ languageCode: "pt", name: "Teste" }],
      };
      const result = (interceptor as any).transformResponse(data, "pt");
      expect(result.name).toBe("Teste");
    });

    it("should return original item if no translations", () => {
      const data = { id: 1, name: "Test" };
      const result = (interceptor as any).transformResponse(data, "en");
      expect(result).toEqual(data);
    });

    it("should return item with translations when no matching language and no en fallback", () => {
      const data = {
        translations: [{ languageCode: "es", name: "Prueba" }],
      };
      const result = (interceptor as any).transformResponse(data, "pt");
      expect(result.translations).toBeDefined();
    });

    it("should include description if available in translation", () => {
      const data = {
        translations: [
          {
            languageCode: "en",
            name: "Test",
            description: "Test description",
          },
        ],
      };
      const result = (interceptor as any).transformResponse(data, "en");
      expect(result.name).toBe("Test");
      expect(result.description).toBe("Test description");
    });

    it("should delete defaultLanguage from result", () => {
      const data = {
        defaultLanguage: "en",
        translations: [{ languageCode: "en", name: "Test" }],
      };
      const result = (interceptor as any).transformResponse(data, "en");
      expect(result.defaultLanguage).toBeUndefined();
    });

    it("should apply all translation fields when available", () => {
      const data = {
        translations: [
          {
            languageCode: "en",
            name: "Test Name",
            acronym: "TNA",
            description: "Test Desc",
          },
        ],
      };
      const result = (interceptor as any).transformResponse(data, "en");
      expect(result.name).toBe("Test Name");
      expect(result.acronym).toBe("TNA");
      expect(result.description).toBe("Test Desc");
    });

    it("should handle translation without optional name", () => {
      const data = {
        translations: [
          {
            languageCode: "en",
            acronym: "TNA",
            description: "Test Desc",
          },
        ],
      };
      const result = (interceptor as any).transformResponse(data, "en");
      expect(result.acronym).toBe("TNA");
      expect(result.name).toBeUndefined();
    });
  });
});
