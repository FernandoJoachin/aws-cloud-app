import { IsNotEmpty, IsNumber, IsString, Min, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAlumnoDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  matricula: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'promedio must be a number' })
  @Min(0)
  @Max(10)
  promedio: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}