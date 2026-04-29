import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "./i18n.service";

describe("I18nService", () => {
  let service: I18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [I18nService],
    }).compile();

    service = module.get<I18nService>(I18nService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getLanguage", () => {
    it("should return default language 'en'", () => {
      expect(service.getLanguage()).toBe("en");
    });
  });

  describe("setLanguage", () => {
    it("should set the language", () => {
      service.setLanguage("pt");
      expect(service.getLanguage()).toBe("pt");
    });

    it("should allow changing language multiple times", () => {
      service.setLanguage("pt");
      service.setLanguage("en");
      expect(service.getLanguage()).toBe("en");
    });
  });
});
