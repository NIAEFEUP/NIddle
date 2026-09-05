import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AssociationsModule } from "./associations/associations.module";
import { AuthModule } from "./auth/auth.module";
import { CoursesModule } from "./courses/courses.module";
import { DatabaseModule } from "./database/database.module";
import { DocsModule } from "./docs/docs.module";
import { EventsModule } from "./events/events.module";
import { FacultiesModule } from "./faculties/faculties.module";
import { EntityNotFoundFilter } from "./filters/entity-not-found.filter";
import { QueryFailedErrorFilter } from "./filters/query-failed-error.filter";
import { RequestsModule } from "./requests/requests.module";
import { ServicesModule } from "./services/services.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: [".env.local"],
    }),
    DatabaseModule,
    FacultiesModule,
    UsersModule,
    AuthModule,
    AssociationsModule,
    ServicesModule,
    EventsModule,
    CoursesModule,
    RequestsModule,
    DocsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    { provide: APP_FILTER, useClass: EntityNotFoundFilter },
    { provide: APP_FILTER, useClass: QueryFailedErrorFilter },
  ],
})
export class AppModule {}
