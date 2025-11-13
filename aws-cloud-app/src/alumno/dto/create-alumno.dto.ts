import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAlumnoDto {
  @IsInt()
  @IsPositive()
  id: number;

  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsNotEmpty()
  matricula: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'promedio must be a number' })
  @Min(0)
  @Max(10)
  promedio: number;
}