import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FacultiesModule } from './faculties/faculties.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
    }),
    DatabaseModule,
    FacultiesModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
