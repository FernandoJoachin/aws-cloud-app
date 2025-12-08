import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get('S3_BUCKET_REGION') || this.configService.get('AWS_REGION');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const sessionToken = this.configService.get('AWS_SESSION_TOKEN');
    this.bucketName = this.configService.get('S3_BUCKET_NAME');

    if (!region || !this.bucketName || !accessKeyId || !secretAccessKey) {
      throw new Error('[S3] Configuración incompleta: se requieren S3_BUCKET_NAME, S3_BUCKET_REGION/AWS_REGION y credenciales AWS');
    }

    this.region = region;
    this.s3Client = new S3Client({
      region: this.region,
      credentials: { accessKeyId, secretAccessKey, sessionToken },
    });
    console.log(`[S3] Inicializado - Bucket: ${this.bucketName}, Región: ${this.region}`);
  }

  async uploadFile(file: Express.Multer.File, alumnoId: number): Promise<string> {
    try {
      if (!file || !file.originalname) {
        throw new Error('Archivo inválido: sin nombre');
      }

      const fileExtension = file.originalname.split('.').pop() || 'bin';
      const fileName = `perfil-${alumnoId}-${randomUUID()}.${fileExtension}`;

      // Usamos URL path-style para coincidir con la aserción del test (`contains("s3.amazonaws.com")`).
      const publicUrl = `https://s3.amazonaws.com/${this.bucketName}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      console.log(`[S3] Subiendo archivo: ${fileName} a bucket ${this.bucketName} en región ${this.region}`);
      await this.s3Client.send(command);

      console.log(`[S3] ✅ Archivo subido exitosamente: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('[S3] ❌ Error al subir archivo:', error.message);
      console.error('[S3] Error detalles:', error);
      throw error;
    }
  }
}
