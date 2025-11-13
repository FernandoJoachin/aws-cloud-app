import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class CreateProfesorDto {
  @IsInt()
  @IsPositive()
  id: number;

  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsInt()
  @IsPositive()
  numeroEmpleado: number;

  @IsPositive()
  @Min(0)
  horasClase: number;
}
