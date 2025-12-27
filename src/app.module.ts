import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FacultiesModule } from './faculties/faculties.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { ExistsInDbConstraint } from './validators/exists-in-db.validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
    }),
    DatabaseModule,
    FacultiesModule,
    UsersModule,
    AuthModule,
    EventsModule,
  ],
  providers: [ExistsInDbConstraint],
  controllers: [AppController],
})
export class AppModule {}
