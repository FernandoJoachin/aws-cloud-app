import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profesor } from './entities/profesor.entity';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';

@Injectable()
export class ProfesorService {
  constructor(
    @InjectRepository(Profesor)
    private profesorRepository: Repository<Profesor>,
  ) {}

  async findAll(): Promise<Profesor[]> {
    return this.profesorRepository.find();
  }

  async findOne(id: number): Promise<Profesor> {
    const profesor = await this.profesorRepository.findOne({ where: { id } });
    if (!profesor) throw new NotFoundException();
    return profesor;
  }

  async create(dto: CreateProfesorDto): Promise<Profesor> {
    const profesor = this.profesorRepository.create(dto);
    return this.profesorRepository.save(profesor);
  }

  async update(id: number, dto: UpdateProfesorDto): Promise<Profesor> {
    const profesor = await this.findOne(id);
    Object.assign(profesor, dto);
    return this.profesorRepository.save(profesor);
  }

  async remove(id: number) {
    const profesor = await this.findOne(id);
    await this.profesorRepository.remove(profesor);
    return { deleted: true };
  }
}