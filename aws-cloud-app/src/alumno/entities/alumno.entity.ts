import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('alumnos')
export class Alumno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ unique: true })
  matricula: string;

  @Column('decimal', { precision: 3, scale: 2 })
  promedio: number;

  @Column()
  password: string;

  @Column({ nullable: true })
  fotoPerfilUrl: string;
}