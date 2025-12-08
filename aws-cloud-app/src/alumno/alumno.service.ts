import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from './entities/alumno.entity';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import * as bcrypt from 'bcrypt';
import { S3Service } from './s3.service';
import { SnsService } from './sns.service';
import { DynamoDbService } from './dynamodb.service';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepository: Repository<Alumno>,
    private s3Service: S3Service,
    private snsService: SnsService,
    private dynamoDbService: DynamoDbService,
  ) {}

  async findAll(): Promise<Alumno[]> {
    return this.alumnoRepository.find();
  }

  async findOne(id: number): Promise<Alumno> {
    const alumno = await this.alumnoRepository.findOne({ where: { id } });
    if (!alumno) throw new NotFoundException();
    return alumno;
  }

  async create(dto: CreateAlumnoDto): Promise<Alumno> {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const alumno = this.alumnoRepository.create({
        ...dto,
        password: hashedPassword,
      });
      return await this.alumnoRepository.save(alumno);
    } catch (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        throw new ConflictException('La matrícula ya existe');
      }
      console.error('[AlumnoService] Error creando alumno:', error);
      throw error;
    }
  }

  async update(id: number, dto: UpdateAlumnoDto): Promise<Alumno> {
    const alumno = await this.findOne(id);
    
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(alumno, dto);
    return this.alumnoRepository.save(alumno);
  }

  async remove(id: number) {
    const alumno = await this.findOne(id);
    await this.alumnoRepository.remove(alumno);
    return { deleted: true };
  }

  async uploadProfilePhoto(id: number, file: Express.Multer.File) {
    try {
      console.log(`[AlumnoService] uploadProfilePhoto: id=${id}, file=${file?.originalname}`);
      const alumno = await this.findOne(id);
      console.log(`[AlumnoService] Alumno encontrado: ${alumno.id}`);
      
      const photoUrl = await this.s3Service.uploadFile(file, id);
      console.log(`[AlumnoService] URL de S3: ${photoUrl}`);
      
      alumno.fotoPerfilUrl = photoUrl;
      await this.alumnoRepository.save(alumno);
      console.log(`[AlumnoService] Alumno actualizado con fotoPerfilUrl`);
      
      const response = { fotoPerfilUrl: photoUrl };
      console.log(`[AlumnoService] Retornando: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      console.error(`[AlumnoService] Error en uploadProfilePhoto:`, error.message);
      console.error(error);
      throw error;
    }
  }

  async sendEmail(id: number): Promise<{ sent: boolean }> {
    const alumno = await this.findOne(id);
    await this.snsService.sendAlumnoEmail(alumno);
    return { sent: true };
  }

  async login(id: number, password: string) {
    const alumno = await this.findOne(id);
    const isValid = await bcrypt.compare(password, alumno.password);
    
    if (!isValid) {
      throw new BadRequestException('Invalid password');
    }

    const session = await this.dynamoDbService.createSession(id);
    return {
      sessionId: session.sessionId,
      sessionString: session.sessionString,
      alumnoId: session.alumnoId,
      timestamp: session.timestamp,
    };
  }

  async verifySession(id: number, sessionString: string) {
    const isValid = await this.dynamoDbService.verifySession(sessionString, id);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired session');
    }
    return { valid: isValid };
  }

  async logout(id: number, sessionString: string) {
    await this.dynamoDbService.logoutSessionByString(sessionString, id);
    return { loggedOut: true };
  }
}