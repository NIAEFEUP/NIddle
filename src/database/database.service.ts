import { Injectable } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService extends TypeOrmModule {}
