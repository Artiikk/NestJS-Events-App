import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './subject.entity';
import { Teacher } from './teacher.entity';
import { SchoolController } from './school.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Teacher])],
  controllers: [SchoolController],
})
export class SchoolModule {}
