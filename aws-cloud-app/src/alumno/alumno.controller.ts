import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
  HttpStatus,
  MethodNotAllowedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AlumnoService } from './alumno.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Controller('alumnos')
export class AlumnoController {
  constructor(private readonly service: AlumnoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() dto: CreateAlumnoDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(@Param('id') id: string, @Body() dto: UpdateAlumnoDto) {
    return this.service.update(+id, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  deleteRoot() {
    throw new MethodNotAllowedException();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
