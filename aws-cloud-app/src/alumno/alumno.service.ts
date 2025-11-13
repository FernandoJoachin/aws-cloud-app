import { Injectable, NotFoundException } from '@nestjs/common';
import { Alumno } from './entities/alumno.entity';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Injectable()
export class AlumnoService {
  private alumnos: Alumno[] = [];

  findAll() {
    return this.alumnos;
  }

  findOne(id: number): Alumno {
    const alumno = this.alumnos.find(a => a.id === id);
    if (!alumno) throw new NotFoundException();
    return alumno;
  }

  create(dto: CreateAlumnoDto): Alumno {
    this.alumnos.push(dto);
    return dto;
  }

  update(id: number, dto: UpdateAlumnoDto): Alumno {
    const index = this.alumnos.findIndex(a => a.id === id);
    if (index === -1) throw new NotFoundException();
    this.alumnos[index] = { ...this.alumnos[index], ...dto };
    return this.alumnos[index];
  }

  remove(id: number) {
    const index = this.alumnos.findIndex(a => a.id === id);
    if (index === -1) throw new NotFoundException();
    this.alumnos.splice(index, 1);
    return { deleted: true };
  }
}