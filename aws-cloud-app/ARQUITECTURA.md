# Arquitectura AWS Cloud App - Segunda Entrega

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                     │
│                    (Postman, curl, Browser)                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                       NESTJS APPLICATION                                 │
│                        (Port 3000)                                       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                     AlumnoController                          │      │
│  │  - GET /alumnos                                               │      │
│  │  - POST /alumnos                                              │      │
│  │  - GET /alumnos/:id                                           │      │
│  │  - PUT /alumnos/:id                                           │      │
│  │  - DELETE /alumnos/:id                                        │      │
│  │  - POST /alumnos/:id/fotoPerfil                               │      │
│  │  - POST /alumnos/:id/email                                    │      │
│  │  - POST /alumnos/:id/session/login                            │      │
│  │  - POST /alumnos/:id/session/verify                           │      │
│  │  - POST /alumnos/:id/session/logout                           │      │
│  └──────────────┬───────────────┬────────────┬──────────────────┘      │
│                 │               │            │                          │
│  ┌──────────────▼─────┐ ┌──────▼──────┐ ┌──▼────────────┐             │
│  │  AlumnoService     │ │  S3Service  │ │  SNSService   │             │
│  │  - TypeORM Repo    │ │  - Upload   │ │  - Publish    │             │
│  │  - bcrypt          │ │             │ │               │             │
│  └──────────┬─────────┘ └──────┬──────┘ └──┬────────────┘             │
│             │                   │            │                          │
│  ┌──────────▼───────────────────┴────────────┴──────────────┐          │
│  │               DynamoDbService                             │          │
│  │  - createSession()                                        │          │
│  │  - verifySession()                                        │          │
│  │  - logoutSession()                                        │          │
│  └───────────────────────────────┬───────────────────────────┘          │
│                                  │                                      │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                     ProfesorController                        │      │
│  │  - GET /profesores                                            │      │
│  │  - POST /profesores                                           │      │
│  │  - GET /profesores/:id                                        │      │
│  │  - PUT /profesores/:id                                        │      │
│  │  - DELETE /profesores/:id                                     │      │
│  └──────────────┬────────────────────────────────────────────────┘      │
│                 │                                                        │
│  ┌──────────────▼─────┐                                                 │
│  │  ProfesorService   │                                                 │
│  │  - TypeORM Repo    │                                                 │
│  └────────────────────┘                                                 │
│                                                                          │
└──────────┬───────────────┬────────────────┬─────────────┬──────────────┘
           │               │                │             │
           │               │                │             │
  ┌────────▼──────┐ ┌──────▼──────┐  ┌─────▼──────┐ ┌───▼──────────┐
  │               │ │             │  │            │ │              │
  │  AWS RDS      │ │   AWS S3    │  │  AWS SNS   │ │  AWS         │
  │  PostgreSQL   │ │   Bucket    │  │   Topic    │ │  DynamoDB    │
  │               │ │             │  │            │ │              │
  │ ┌───────────┐ │ │ ┌─────────┐ │  │ ┌────────┐ │ │ ┌──────────┐ │
  │ │  alumnos  │ │ │ │  fotos  │ │  │ │ Email  │ │ │ │sesiones- │ │
  │ │  table    │ │ │ │  perfil │ │  │ │Subscription│││ │alumnos  │ │
  │ └───────────┘ │ │ └─────────┘ │  │ └────────┘ │ │ │  table   │ │
  │ ┌───────────┐ │ │             │  │            │ │ └──────────┘ │
  │ │profesores │ │ │  Public     │  │  Publishes │ │              │
  │ │  table    │ │ │  Read       │  │  to Email  │ │  Sessions    │
  │ └───────────┘ │ │             │  │            │ │  Store       │
  │               │ │             │  │            │ │              │
  │  Auto-gen IDs │ │  Public URLs│  │  JSON Msg  │ │ sessionId:PK │
  └───────────────┘ └─────────────┘  └────────────┘ └──────────────┘
```

## Flujo de Datos por Funcionalidad

### 1. CRUD Básico (Alumnos/Profesores)

```
Cliente → Controller → Service → TypeORM Repository → RDS PostgreSQL
                                                         │
                                                         ├─ alumnos table
                                                         └─ profesores table
```

**Características:**
- IDs autogenerados por PostgreSQL
- Passwords hasheados con bcrypt antes de guardar
- Validación con class-validator en DTOs

### 2. Subir Foto de Perfil

```
Cliente (multipart/form-data)
   ↓
AlumnoController.uploadProfilePhoto()
   ↓
AlumnoService.uploadProfilePhoto()
   ↓
S3Service.uploadFile()
   ↓
AWS S3 Bucket
   ↓ (retorna URL pública)
AlumnoService.save(fotoPerfilUrl)
   ↓
RDS PostgreSQL (actualiza campo fotoPerfilUrl)
```

**Flujo:**
1. Cliente envía imagen en form-data
2. NestJS valida tipo y tamaño (max 5MB, jpg/png/gif)
3. S3Service genera nombre único con UUID
4. Sube a S3 con ACL public-read
5. Obtiene URL pública
6. Guarda URL en base de datos
7. Retorna alumno actualizado

### 3. Enviar Email (SNS)

```
Cliente
   ↓
AlumnoController.sendEmail(id)
   ↓
AlumnoService.sendEmail(id)
   ↓
  ├─ Busca alumno en RDS
  └─ SnsService.sendAlumnoEmail(alumno)
        ↓
     AWS SNS Topic
        ↓
     Email Subscription
        ↓
     Usuario recibe email
```

**Formato del Mensaje:**
```json
{
  "alumnoId": 1,
  "nombres": "Juan",
  "apellidos": "Pérez",
  "matricula": "A00123456",
  "promedio": 8.5
}
```

### 4. Sistema de Sesiones (DynamoDB)

#### Login Flow

```
Cliente (POST /alumnos/:id/session/login)
   ↓ { password: "..." }
AlumnoController.login()
   ↓
AlumnoService.login(id, password)
   ├─ Busca alumno en RDS
   ├─ bcrypt.compare(password, alumno.password)
   └─ DynamoDbService.createSession(alumnoId)
         ↓
      AWS DynamoDB
         ↓ (crea item)
      {
        sessionId: UUID,
        alumnoId: number,
        sessionString: random 128 chars,
        timestamp: ISO-8601,
        active: true
      }
         ↓
      Retorna sesión al cliente
```

#### Verify Flow

```
Cliente (POST /alumnos/:id/session/verify)
   ↓ { sessionString: "..." }
AlumnoController.verifySession()
   ↓
AlumnoService.verifySession(id, sessionString)
   ↓
DynamoDbService.verifySession(sessionString, alumnoId)
   ↓
AWS DynamoDB.GetItem(sessionId)
   ↓
Verifica: active === true && alumnoId === id
   ↓
Retorna { valid: boolean }
```

#### Logout Flow

```
Cliente (POST /alumnos/:id/session/logout)
   ↓ { sessionId: "..." }
AlumnoController.logout()
   ↓
AlumnoService.logout(sessionId)
   ↓
DynamoDbService.logoutSession(sessionId)
   ↓
AWS DynamoDB.UpdateItem(sessionId, { active: false })
   ↓
Retorna { loggedOut: true }
```

## Modelo de Datos

### RDS PostgreSQL

#### Tabla: alumnos
```sql
CREATE TABLE alumnos (
  id SERIAL PRIMARY KEY,              -- Auto-generado
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  matricula VARCHAR(255) UNIQUE NOT NULL,
  promedio DECIMAL(3,2) NOT NULL,
  password VARCHAR(255) NOT NULL,     -- Hasheado con bcrypt
  fotoPerfilUrl VARCHAR(500) NULL     -- URL pública de S3
);
```

#### Tabla: profesores
```sql
CREATE TABLE profesores (
  id SERIAL PRIMARY KEY,              -- Auto-generado
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  numeroEmpleado INTEGER UNIQUE NOT NULL,
  horasClase INTEGER NOT NULL
);
```

### DynamoDB

#### Tabla: sesiones-alumnos
```
Partition Key: sessionId (String)

Item Structure:
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",  // UUID
  "alumnoId": 1,                                        // Number
  "sessionString": "AbCdEf...",                         // String (128 chars)
  "timestamp": "2025-11-21T12:00:00.000Z",              // ISO-8601
  "active": true                                        // Boolean
}
```

### S3 Bucket

```
Bucket: aws-cloud-app-fotos/
  ├── perfil-1-550e8400-e29b-41d4-a716-446655440000.jpg
  ├── perfil-2-660f9511-f3ac-52e5-b827-557766551111.png
  └── perfil-3-770g0622-g4bd-63f6-c938-668877662222.gif

ACL: public-read
URL Format: https://{bucket}.s3.{region}.amazonaws.com/{key}
```

## Seguridad

### Autenticación y Autorización
```
Password Storage:
  Plain Text → bcrypt.hash(password, 10) → $2b$10$...hash...

Session Verification:
  Client → sessionString → DynamoDB → validate(active && alumnoId)
```

### IAM Permissions

```
┌─────────────────────────────────────────────────┐
│           IAM User: aws-cloud-app-user          │
│                                                 │
│  Permissions:                                   │
│    ├─ s3:PutObject → aws-cloud-app-fotos/*     │
│    ├─ s3:PutObjectAcl → aws-cloud-app-fotos/*  │
│    ├─ sns:Publish → alumno-notifications topic │
│    ├─ dynamodb:PutItem → sesiones-alumnos      │
│    ├─ dynamodb:GetItem → sesiones-alumnos      │
│    └─ dynamodb:UpdateItem → sesiones-alumnos   │
│                                                 │
│  Credentials:                                   │
│    - Access Key ID                              │
│    - Secret Access Key                          │
└─────────────────────────────────────────────────┘
```

### Network Security

```
┌──────────────────────────────────────┐
│  RDS Security Group                  │
│                                      │
│  Inbound Rules:                      │
│    - Type: PostgreSQL                │
│    - Port: 5432                      │
│    - Source: Your IP / Application IP│
│                                      │
│  Outbound Rules:                     │
│    - All traffic                     │
└──────────────────────────────────────┘
```

## Escalabilidad

### Consideraciones

**RDS:**
- Vertical: Cambiar tipo de instancia (t3.micro → t3.medium)
- Horizontal: Read Replicas para lectura
- Storage: Auto-scaling habilitado

**S3:**
- Automático: Escala ilimitadamente
- Performance: CloudFront CDN para distribución global

**DynamoDB:**
- On-Demand: Auto-scaling automático
- Provisioned: Configurar Auto Scaling para RCU/WCU

**NestJS:**
- Horizontal: Deploy múltiples instancias detrás de Load Balancer
- Containerización: Docker + ECS/EKS
- Serverless: Lambda con API Gateway

## Monitoreo y Logging

```
┌──────────────────────────────────────────────┐
│            AWS CloudWatch                    │
│                                              │
│  ├─ RDS Metrics                              │
│  │   - CPU Utilization                       │
│  │   - Database Connections                  │
│  │   - Free Storage Space                    │
│  │                                           │
│  ├─ S3 Metrics                               │
│  │   - Number of Objects                     │
│  │   - Bucket Size                           │
│  │                                           │
│  ├─ DynamoDB Metrics                         │
│  │   - Consumed Read/Write Capacity          │
│  │   - User Errors                           │
│  │                                           │
│  └─ Application Logs (via Winston)          │
│      - Error logs                            │
│      - Request logs                          │
│      - Performance logs                      │
└──────────────────────────────────────────────┘
```

## Costos Estimados (Desarrollo)

```
┌──────────────────────────────────────────────┐
│  Servicio           Configuración    Costo   │
├──────────────────────────────────────────────┤
│  RDS PostgreSQL     db.t3.micro      $15/mes │
│  S3                 10GB storage     $1/mes   │
│  SNS                1000 emails      $0.5/mes │
│  DynamoDB          On-demand         $1/mes   │
│  Data Transfer     1GB               $0/mes   │
├──────────────────────────────────────────────┤
│  TOTAL                               $17.5/mes│
└──────────────────────────────────────────────┘
```

## Mejoras Futuras

1. **Autenticación JWT** para proteger endpoints
2. **API Gateway** en front de la aplicación
3. **CloudFront CDN** para S3
4. **ElastiCache** para cacheo de sesiones
5. **CloudWatch Alarms** para alertas
6. **AWS Secrets Manager** para credenciales
7. **RDS Encryption** at rest
8. **VPC** para aislamiento de red
9. **WAF** para protección web
10. **CI/CD Pipeline** con CodePipeline

## Referencias

- NestJS: https://nestjs.com/
- TypeORM: https://typeorm.io/
- AWS SDK v3: https://docs.aws.amazon.com/sdk-for-javascript/v3/
- bcrypt: https://github.com/kelektiv/node.bcrypt.js
