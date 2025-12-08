import { PartialType } from '@nestjs/mapped-types';
import { CreateAlumnoDto } from './create-alumno.dto';
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional, MinLength } from 'class-validator';

export class UpdateAlumnoDto extends PartialType(CreateAlumnoDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombres?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  apellidos?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  matricula?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  promedio?: number;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}