import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('profesores')
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ unique: true })
  numeroEmpleado: number;

  @Column('int')
  horasClase: number;
}