import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { TranslationInterceptor } from "./common/interceptors/translation.interceptor";
import { CoursesModule } from "./courses/courses.module";
import { DatabaseModule } from "./database/database.module";
import { EventsModule } from "./events/events.module";
import { FacultiesModule } from "./faculties/faculties.module";
import { I18nModule } from "./i18n/i18n.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env.local"],
    }),
    DatabaseModule,
    I18nModule,
    FacultiesModule,
    UsersModule,
    AuthModule,
    EventsModule,
    CoursesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TranslationInterceptor,
    },
  ],
})
export class AppModule {}
