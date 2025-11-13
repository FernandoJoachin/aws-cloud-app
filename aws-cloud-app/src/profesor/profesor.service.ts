import { Injectable, NotFoundException } from '@nestjs/common';
import { Profesor } from './entities/profesor.entity';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';

@Injectable()
export class ProfesorService {
  private profesores: Profesor[] = [];

  findAll() {
    return this.profesores;
  }

  findOne(id: number): Profesor {
    const prof = this.profesores.find(p => p.id === id);
    if (!prof) throw new NotFoundException();
    return prof;
  }

  create(dto: CreateProfesorDto) {
    this.profesores.push(dto);
    return dto;
  }

  update(id: number, dto: UpdateProfesorDto) {
    const index = this.profesores.findIndex(p => p.id === id);
    if (index === -1) throw new NotFoundException();
    this.profesores[index] = { ...this.profesores[index], ...dto };
    return this.profesores[index];
  }

  remove(id: number) {
    const index = this.profesores.findIndex(p => p.id === id);
    if (index === -1) throw new NotFoundException();
    this.profesores.splice(index, 1);
    return { deleted: true };
  }
}