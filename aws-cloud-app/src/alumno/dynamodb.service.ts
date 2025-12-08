import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

export interface Session {
  sessionId: string;
  alumnoId: number;
  sessionString: string;
  timestamp: string;
  active: boolean;
}

@Injectable()
export class DynamoDbService {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get('DYNAMODB_REGION') || this.configService.get('AWS_REGION');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const sessionToken = this.configService.get('AWS_SESSION_TOKEN');
    this.tableName = this.configService.get('DYNAMODB_TABLE_NAME');

    if (!region || !accessKeyId || !secretAccessKey || !this.tableName) {
      throw new Error('[DynamoDB] Configuración incompleta: se requieren AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, DYNAMODB_REGION/AWS_REGION y DYNAMODB_TABLE_NAME');
    }

    const client = new DynamoDBClient({
      region,
      credentials: { accessKeyId, secretAccessKey, sessionToken },
    });
    this.docClient = DynamoDBDocumentClient.from(client);
    console.log('[DynamoDB] Cliente AWS DynamoDB inicializado');
  }

  private generateSessionString(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 128; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createSession(alumnoId: number): Promise<Session> {
    const sessionString = this.generateSessionString();
    const session: Session = {
      sessionId: randomUUID(),
      alumnoId,
      sessionString,
      timestamp: new Date().toISOString(),
      active: true,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: session,
    });

    console.log(`[DynamoDB] Creando sesión ${session.sessionId}`);
    await this.docClient.send(command);
    console.log(`[DynamoDB] OK: Sesión creada exitosamente: ${session.sessionId}`);
    return session;
  }

  async verifySession(sessionString: string, alumnoId: number): Promise<boolean> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { sessionString },
    });

    console.log(`[DynamoDB] GET: Verificando sesión ${sessionString.substring(0, 10)}... para alumno ${alumnoId}`);
    const response = await this.docClient.send(command);

    if (!response.Item) {
      console.warn('[DynamoDB] Sesión no encontrada');
      return false;
    }

    const session = response.Item as Session;
    const isValid = session.alumnoId === alumnoId && session.active === true;
    console.log(`[DynamoDB] OK: Sesión verificada - activa: ${isValid}`);
    return isValid;
  }

  async logoutSession(sessionId: string): Promise<void> {
    // Este método no se usa, pero lo mantenemos por compatibilidad
    console.log('[DynamoDB] logoutSession (deprecated) - usar logoutSessionByString en su lugar');
  }

  async logoutSessionByString(sessionString: string, alumnoId: number): Promise<void> {
    console.log(`[DynamoDB] UPDATE: Desactivando sesión ${sessionString.substring(0, 10)}... para alumno ${alumnoId}`);

    // Aseguramos que la sesión corresponda al alumno
    const get = new GetCommand({ TableName: this.tableName, Key: { sessionString } });
    const existing = await this.docClient.send(get);
    if (!existing.Item || (existing.Item as Session).alumnoId !== alumnoId) {
      throw new Error('Sesión no encontrada para logout');
    }

    const updateCommand = new UpdateCommand({
      TableName: this.tableName,
      Key: { sessionString },
      UpdateExpression: 'SET active = :active',
      ExpressionAttributeValues: {
        ':active': false,
      },
    });

    await this.docClient.send(updateCommand);
    console.log('[DynamoDB] OK: Sesión desactivada');
  }
}
