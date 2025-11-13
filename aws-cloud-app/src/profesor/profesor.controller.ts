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
import { ProfesorService } from './profesor.service';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';

@Controller('profesores')
export class ProfesorController {
  constructor(private readonly service: ProfesorService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() dto: CreateProfesorDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(@Param('id') id: string, @Body() dto: UpdateProfesorDto) {
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