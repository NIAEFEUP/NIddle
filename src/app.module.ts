import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FacultiesModule } from './faculties/faculties.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
    }),
    DatabaseModule,
    FacultiesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
