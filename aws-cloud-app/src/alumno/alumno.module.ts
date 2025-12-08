import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnoService } from './alumno.service';
import { AlumnoController } from './alumno.controller';
import { Alumno } from './entities/alumno.entity';
import { S3Service } from './s3.service';
import { SnsService } from './sns.service';
import { DynamoDbService } from './dynamodb.service';

@Module({
  imports: [TypeOrmModule.forFeature([Alumno])],
  controllers: [AlumnoController],
  providers: [AlumnoService, S3Service, SnsService, DynamoDbService],
})
export class AlumnoModule {}
