import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesorService } from './profesor.service';
import { ProfesorController } from './profesor.controller';
import { Profesor } from './entities/profesor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profesor])],
  controllers: [ProfesorController],
  providers: [ProfesorService],
})
export class ProfesorModule {}
