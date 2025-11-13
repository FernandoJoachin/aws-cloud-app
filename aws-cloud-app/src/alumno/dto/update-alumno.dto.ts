import { PartialType } from '@nestjs/mapped-types';
import { CreateAlumnoDto } from './create-alumno.dto';
import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateAlumnoDto extends PartialType(CreateAlumnoDto) {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  matricula: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  promedio: number;
}