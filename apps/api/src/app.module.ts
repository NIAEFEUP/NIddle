import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AssociationsModule } from "./associations/associations.module";
import { AuthModule } from "./auth/auth.module";
import { CoursesModule } from "./courses/courses.module";
import { DatabaseModule } from "./database/database.module";
import { EventsModule } from "./events/events.module";
import { FacultiesModule } from "./faculties/faculties.module";
import { EntityNotFoundFilter } from "./filters/entity-not-found.filter";
import { ServicesModule } from "./services/services.module";
import { UsersModule } from "./users/users.module";
import { RequestsModule } from './requests/requests.module';

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
  ],
  controllers: [AppController],
  providers: [
    // Sentry's filter must be registered first so it sees exceptions before
    // any narrower filter (like EntityNotFoundFilter) fully handles them.
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    { provide: APP_FILTER, useClass: EntityNotFoundFilter },
  ],
})
export class AppModule {}
