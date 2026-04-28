import { Injectable } from "@nestjs/common";

@Injectable()
export class I18nService {
  private language: string = "en";

  setLanguage(language: string): void {
    this.language = language;
  }

  getLanguage(): string {
    return this.language;
  }
}
