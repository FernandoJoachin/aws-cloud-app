# Configuración AWS Cloud App - Segunda Entrega

## Instrucciones de Configuración

Este archivo contiene información detallada para configurar correctamente tu archivo `.env`.

### 1. Base de Datos RDS PostgreSQL

1. Ve a la consola de AWS RDS
2. Crea una instancia PostgreSQL (versión 14+)
3. Configura:
   - DB Instance Identifier: `aws-cloud-app-db`
   - Master username: `postgres`
   - Master password: (tu contraseña)
   - DB Name: `cloudapp`
   - Public accessibility: Yes (solo para desarrollo)
4. Espera a que la instancia esté disponible
5. Copia el endpoint (algo como: `database-1.xxxxx.us-east-1.rds.amazonaws.com`)

**Variables .env:**
```
DB_HOST=database-1.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_DATABASE=cloudapp
```

### 2. AWS Credenciales IAM

1. Ve a IAM → Users → Create User
2. Nombre: `aws-cloud-app-user`
3. Acceso: Programmatic access
4. Permisos: Crear policy personalizada (ver abajo)
5. Guarda Access Key ID y Secret Access Key

**Policy JSON:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::aws-cloud-app-fotos/*"
    },
    {
      "Sid": "SNSPublish",
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:us-east-1:TU_ACCOUNT_ID:alumno-notifications"
    },
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:TU_ACCOUNT_ID:table/sesiones-alumnos"
    }
  ]
}
```

**Variables .env:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJal...
```

### 3. S3 Bucket para Fotos

1. Ve a S3 → Create Bucket
2. Nombre: `aws-cloud-app-fotos` (debe ser único globalmente)
3. Region: us-east-1 (o tu región preferida)
4. **Desactiva** "Block all public access"
5. Confirma que quieres hacer el bucket público

**Bucket Policy** (S3 → Permissions → Bucket Policy):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::aws-cloud-app-fotos/*"
    }
  ]
}
```

**Variables .env:**
```
S3_BUCKET_NAME=aws-cloud-app-fotos
S3_BUCKET_REGION=us-east-1
```

### 4. SNS Topic para Emails

1. Ve a SNS → Topics → Create Topic
2. Type: Standard
3. Name: `alumno-notifications`
4. Create topic
5. En la pantalla del topic, ve a Subscriptions → Create Subscription
6. Protocol: Email
7. Endpoint: tu_email@example.com
8. Create subscription
9. **IMPORTANTE**: Revisa tu email y confirma la suscripción
10. Copia el ARN del topic (algo como: `arn:aws:sns:us-east-1:123456789012:alumno-notifications`)

**Variables .env:**
```
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:alumno-notifications
```

### 5. DynamoDB para Sesiones

1. Ve a DynamoDB → Tables → Create Table
2. Table name: `sesiones-alumnos`
3. Partition key: `sessionId` (String)
4. **NO** agregues Sort key
5. Settings: Default settings (o On-demand)
6. Create table

**Variables .env:**
```
DYNAMODB_TABLE_NAME=sesiones-alumnos
DYNAMODB_REGION=us-east-1
```

## Archivo .env Completo de Ejemplo

```env
# Database Configuration (RDS PostgreSQL)
DB_HOST=database-1.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=MiPasswordSeguro123!
DB_DATABASE=cloudapp

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# S3 Configuration
S3_BUCKET_NAME=aws-cloud-app-fotos
S3_BUCKET_REGION=us-east-1

# SNS Configuration
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:alumno-notifications

# DynamoDB Configuration
DYNAMODB_TABLE_NAME=sesiones-alumnos
DYNAMODB_REGION=us-east-1
```

## Verificación de Configuración

### RDS
```bash
# Probar conexión desde tu máquina
psql -h database-1.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d cloudapp
```

### S3
```bash
# Listar buckets
aws s3 ls

# Subir archivo de prueba
aws s3 cp test.jpg s3://aws-cloud-app-fotos/test.jpg --acl public-read
```

### SNS
```bash
# Publicar mensaje de prueba
aws sns publish --topic-arn arn:aws:sns:us-east-1:123456789012:alumno-notifications --message "Test"
```

### DynamoDB
```bash
# Listar tablas
aws dynamodb list-tables

# Describir tabla
aws dynamodb describe-table --table-name sesiones-alumnos
```

## Costos Estimados (USD/mes)

- **RDS PostgreSQL** (db.t3.micro): ~$15-20
- **S3**: $0.023/GB + $0.0004/1000 requests ≈ $1-5
- **SNS**: $0.50/1M requests ≈ $0.5-1
- **DynamoDB** (On-demand): $1.25/million write requests ≈ $1-5

**Total estimado**: $18-31 USD/mes para desarrollo

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca commitees el archivo `.env` al repositorio
- Rota tus credenciales AWS regularmente
- En producción, usa AWS Secrets Manager o Parameter Store
- Configura MFA para tu cuenta AWS
- Usa roles de IAM en EC2 en lugar de credenciales hardcodeadas

## Troubleshooting

### RDS no se conecta
- Verifica Security Group permite tráfico en puerto 5432 desde tu IP
- Verifica que "Publicly accessible" está en Yes
- Revisa VPC y subnets

### S3 Access Denied al subir
- Verifica IAM policy incluye s3:PutObject y s3:PutObjectAcl
- Verifica región es correcta
- Verifica nombre del bucket

### SNS no envía emails
- Verifica que confirmaste la suscripción por email
- Verifica el ARN del topic es correcto
- Revisa CloudWatch Logs para errores

### DynamoDB no guarda sesiones
- Verifica nombre de la tabla
- Verifica partition key es "sessionId" (String)
- Verifica permisos IAM

## Comandos Útiles

```bash
# Ver logs de la aplicación
npm run start:dev

# Build para producción
npm run build

# Ejecutar producción
npm run start:prod

# Verificar versión de Node
node --version

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## Soporte

Si encuentras problemas:
1. Revisa los logs de la aplicación
2. Verifica CloudWatch Logs en AWS
3. Usa AWS CLI para probar servicios individualmente
4. Revisa Security Groups y IAM policies
