import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { CoursesModule } from "./courses/courses.module";
import { DatabaseModule } from "./database/database.module";
import { EventsModule } from "./events/events.module";
import { FacultiesModule } from "./faculties/faculties.module";
import { ServicesModule } from "./services/services.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env.local"],
    }),
    DatabaseModule,
    FacultiesModule,
    UsersModule,
    AuthModule,
    ServicesModule,
    EventsModule,
    CoursesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
