# AWS Cloud App - Segunda Entrega

Aplicación NestJS con integración completa de servicios AWS (RDS, S3, SNS, DynamoDB).

## Requisitos Previos

- Node.js 18+
- PostgreSQL (RDS en AWS)
- Cuenta AWS con servicios configurados:
  - RDS PostgreSQL
  - S3 Bucket (público)
  - SNS Topic
  - DynamoDB Table

## Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

#### Variables Requeridas:

**Base de Datos (RDS PostgreSQL):**
- `DB_HOST`: Endpoint de tu instancia RDS
- `DB_PORT`: Puerto (default: 5432)
- `DB_USERNAME`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_DATABASE`: Nombre de la base de datos

**AWS Credenciales:**
- `AWS_REGION`: Región de AWS (ej: us-east-1)
- `AWS_ACCESS_KEY_ID`: Access Key ID de IAM
- `AWS_SECRET_ACCESS_KEY`: Secret Access Key de IAM

**S3:**
- `S3_BUCKET_NAME`: Nombre del bucket S3
- `S3_BUCKET_REGION`: Región del bucket

**SNS:**
- `SNS_TOPIC_ARN`: ARN del topic SNS

**DynamoDB:**
- `DYNAMODB_TABLE_NAME`: sesiones-alumnos (default)
- `DYNAMODB_REGION`: Región de DynamoDB

### 3. Configurar Servicios AWS

#### RDS PostgreSQL
1. Crear instancia RDS PostgreSQL
2. Configurar Security Group para permitir conexiones desde tu IP
3. Crear base de datos
4. TypeORM creará las tablas automáticamente (synchronize: true)

#### S3 Bucket
1. Crear bucket S3
2. Configurar permisos públicos:
   - Desactivar "Block all public access"
   - Agregar Bucket Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::TU_BUCKET/*"
    }
  ]
}
```

#### SNS Topic
1. Crear topic SNS
2. Crear suscripción tipo "Email"
3. Confirmar suscripción desde el email recibido
4. Copiar el ARN del topic

#### DynamoDB
1. Crear tabla `sesiones-alumnos`
2. Partition key: `sessionId` (String)
3. Configurar capacidad (On-demand o Provisioned)

#### IAM Policy
Asegurar que el usuario IAM tenga permisos:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::TU_BUCKET/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "TU_TOPIC_ARN"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT:table/sesiones-alumnos"
    }
  ]
}
```

## Ejecutar la Aplicación

### Modo Desarrollo
```bash
npm run start:dev
```

### Modo Producción
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Alumnos

#### CRUD Básico
- `GET /alumnos` - Listar todos los alumnos
- `POST /alumnos` - Crear alumno (body: nombres, apellidos, matricula, promedio, password)
- `GET /alumnos/:id` - Obtener alumno por ID
- `PUT /alumnos/:id` - Actualizar alumno
- `DELETE /alumnos/:id` - Eliminar alumno

#### Foto de Perfil (S3)
- `POST /alumnos/:id/fotoPerfil` - Subir foto de perfil
  - Content-Type: multipart/form-data
  - Field name: `foto`
  - Formatos: jpg, jpeg, png, gif
  - Tamaño máximo: 5MB

#### Email (SNS)
- `POST /alumnos/:id/email` - Enviar email con datos del alumno

#### Sesiones (DynamoDB)
- `POST /alumnos/:id/session/login` - Login (body: password)
  - Retorna: sessionId, sessionString, alumnoId, timestamp
- `POST /alumnos/:id/session/verify` - Verificar sesión (body: sessionString)
  - Retorna: { valid: boolean }
- `POST /alumnos/:id/session/logout` - Logout (body: sessionId)
  - Retorna: { loggedOut: true }

### Profesores

- `GET /profesores` - Listar todos los profesores
- `POST /profesores` - Crear profesor (body: nombres, apellidos, numeroEmpleado, horasClase)
- `GET /profesores/:id` - Obtener profesor por ID
- `PUT /profesores/:id` - Actualizar profesor
- `DELETE /profesores/:id` - Eliminar profesor

## Ejemplo de Uso

### Crear Alumno
```bash
curl -X POST http://localhost:3000/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "apellidos": "Pérez",
    "matricula": "A00123456",
    "promedio": 8.5,
    "password": "password123"
  }'
```

### Subir Foto de Perfil
```bash
curl -X POST http://localhost:3000/alumnos/1/fotoPerfil \
  -F "foto=@/ruta/a/foto.jpg"
```

### Login
```bash
curl -X POST http://localhost:3000/alumnos/1/session/login \
  -H "Content-Type: application/json" \
  -d '{"password": "password123"}'
```

### Verificar Sesión
```bash
curl -X POST http://localhost:3000/alumnos/1/session/verify \
  -H "Content-Type: application/json" \
  -d '{"sessionString": "SESSION_STRING_GENERADA"}'
```

### Enviar Email
```bash
curl -X POST http://localhost:3000/alumnos/1/email
```

### Logout
```bash
curl -X POST http://localhost:3000/alumnos/1/session/logout \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SESSION_ID_GENERADA"}'
```

## Estructura del Proyecto

```
src/
├── alumno/
│   ├── dto/
│   │   ├── create-alumno.dto.ts
│   │   ├── update-alumno.dto.ts
│   │   ├── login.dto.ts
│   │   └── verify-session.dto.ts
│   ├── entities/
│   │   └── alumno.entity.ts
│   ├── alumno.controller.ts
│   ├── alumno.service.ts
│   ├── alumno.module.ts
│   ├── s3.service.ts
│   ├── sns.service.ts
│   └── dynamodb.service.ts
├── profesor/
│   ├── dto/
│   ├── entities/
│   ├── profesor.controller.ts
│   ├── profesor.service.ts
│   └── profesor.module.ts
├── app.module.ts
└── main.ts
```

## Características Implementadas

### Primera Entrega
✅ CRUD completo para Alumnos
✅ CRUD completo para Profesores
✅ Validación con class-validator
✅ Arquitectura NestJS modular

### Segunda Entrega
✅ Migración a RDS PostgreSQL con TypeORM
✅ IDs autogenerados por la base de datos
✅ Password hasheado con bcrypt
✅ Subida de fotos a S3
✅ Notificaciones por email vía SNS
✅ Sistema de sesiones con DynamoDB
✅ Endpoints de login/verify/logout

## Notas Importantes

1. **Seguridad**: En producción, cambiar `synchronize: true` a `false` en TypeORM
2. **Passwords**: Se hashean automáticamente con bcrypt (salt rounds: 10)
3. **S3**: Las URLs generadas son públicas para acceso directo
4. **DynamoDB**: Las sesiones tienen una clave primaria `sessionId` (UUID)
5. **Session String**: Se genera una cadena aleatoria de 128 caracteres

## Troubleshooting

### Error de conexión a RDS
- Verificar Security Group permite conexiones desde tu IP
- Verificar credenciales en `.env`
- Verificar que la base de datos existe

### Error S3 Access Denied
- Verificar permisos IAM incluyen s3:PutObject y s3:PutObjectAcl
- Verificar bucket policy permite acceso público

### Error SNS
- Verificar el topic ARN es correcto
- Verificar hay al menos una suscripción confirmada
- Verificar permisos IAM incluyen sns:Publish

### Error DynamoDB
- Verificar tabla existe con nombre correcto
- Verificar partition key es `sessionId` (String)
- Verificar permisos IAM

## Licencia

UNLICENSED
