import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class CreateProfesorDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsInt()
  @IsPositive()
  numeroEmpleado: number;

  @IsInt()
  @Min(0)
  horasClase: number;
}
