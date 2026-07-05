import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { I18nService } from "@/i18n/i18n.service";

function extractLanguage(acceptLanguage: string | undefined): string {
  if (!acceptLanguage) return "en";

  const lang = acceptLanguage.split(",")[0].split(";")[0].trim().toLowerCase();

  const supported = ["en", "pt"];
  if (supported.includes(lang)) return lang;

  const prefix = lang.split("-")[0];
  if (supported.includes(prefix)) return prefix;

  return "en";
}

@Injectable()
export class TranslationInterceptor implements NestInterceptor {
  constructor(private i18nService: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const language = extractLanguage(request.headers["accept-language"]);

    this.i18nService.setLanguage(language);
    request.i18nLanguage = language;

    return next
      .handle()
      .pipe(map((data) => this.transformResponse(data, language)));
  }

  private transformResponse(data: unknown, language: string): unknown {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map((item) =>
        this.transformItem(item as Record<string, unknown>, language),
      );
    }

    if (typeof data === "object" && data !== null) {
      return this.transformItem(data as Record<string, unknown>, language);
    }

    return data;
  }

  private transformItem(
    item: Record<string, unknown>,
    language: string,
  ): Record<string, unknown> {
    if (!item.translations) return item;

    const translations = item.translations as Array<Record<string, unknown>>;

    const translation =
      translations.find((t) => (t.languageCode as string) === language) ||
      translations.find((t) => (t.languageCode as string) === "en");

    if (!translation) return item;

    const result: Record<string, unknown> = { ...item };
    delete result.translations;
    delete result.defaultLanguage;

    if (translation.name !== undefined) result.name = translation.name;
    if (translation.acronym !== undefined) result.acronym = translation.acronym;
    if (translation.description !== undefined)
      result.description = translation.description;

    return result;
  }
}
