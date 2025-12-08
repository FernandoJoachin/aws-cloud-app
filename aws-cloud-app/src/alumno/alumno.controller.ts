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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AlumnoService } from './alumno.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { LoginDto } from './dto/login.dto';
import { VerifySessionDto } from './dto/verify-session.dto';

@Controller('alumnos')
export class AlumnoController {
  constructor(private readonly service: AlumnoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
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

  @Post(':id/fotoPerfil')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('foto'))
  async uploadProfilePhoto(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(`[AlumnoController] uploadProfilePhoto - id: ${id}, file: ${file?.originalname}`);
    try {
      const result = await this.service.uploadProfilePhoto(+id, file);
      console.log(`[AlumnoController] uploadProfilePhoto result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.error(`[AlumnoController] uploadProfilePhoto error:`, error);
      throw error;
    }
  }

  @Post(':id/email')
  @HttpCode(HttpStatus.OK)
  sendEmail(@Param('id') id: string) {
    return this.service.sendEmail(+id);
  }

  @Post(':id/session/login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  login(@Param('id') id: string, @Body() dto: LoginDto) {
    return this.service.login(+id, dto.password);
  }

  @Post(':id/session/verify')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  verifySession(@Param('id') id: string, @Body() dto: VerifySessionDto) {
    return this.service.verifySession(+id, dto.sessionString);
  }

  @Post(':id/session/logout')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  logout(@Param('id') id: string, @Body() dto: VerifySessionDto) {
    return this.service.logout(+id, dto.sessionString);
  }
}
