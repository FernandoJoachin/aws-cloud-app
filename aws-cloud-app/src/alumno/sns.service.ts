import { Injectable } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { ConfigService } from '@nestjs/config';
import { Alumno } from './entities/alumno.entity';

@Injectable()
export class SnsService {
  private snsClient: SNSClient;
  private topicArn: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get('AWS_REGION') || 'us-east-1';
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const sessionToken = this.configService.get('AWS_SESSION_TOKEN');
    this.topicArn = this.configService.get('SNS_TOPIC_ARN');

    if (!region || !accessKeyId || !secretAccessKey || !this.topicArn) {
      throw new Error('[SNS] Configuración incompleta: se requieren AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY y SNS_TOPIC_ARN');
    }

    this.snsClient = new SNSClient({
      region,
      credentials: { accessKeyId, secretAccessKey, sessionToken },
    });
  }

  async sendAlumnoEmail(alumno: Alumno): Promise<void> {
    const message = JSON.stringify({
      alumnoId: alumno.id,
      nombres: alumno.nombres,
      apellidos: alumno.apellidos,
      matricula: alumno.matricula,
      promedio: alumno.promedio,
    });

    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: message,
      Subject: `Información del Alumno: ${alumno.nombres} ${alumno.apellidos}`,
    });

    await this.snsClient.send(command);
  }
}
