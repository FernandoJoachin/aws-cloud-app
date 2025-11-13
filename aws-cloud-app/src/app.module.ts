import { Module } from '@nestjs/common';
import { AlumnoModule } from './alumno/alumno.module';
import { ProfesorModule } from './profesor/profesor.module';

@Module({
  imports: [AlumnoModule, ProfesorModule],
})
export class AppModule {}
