import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FacultiesModule } from './faculties/faculties.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { EventsModule } from './events/events.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
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
