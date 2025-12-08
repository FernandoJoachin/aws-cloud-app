# Setup de DynamoDB

## Crear Tabla Usando AWS Console

1. Ve a AWS Console → DynamoDB → Tables
2. Click "Create table"
3. Configuración:
   - **Table name**: `sesiones-alumnos`
   - **Partition key**: `sessionId` (String)
   - **Sort key**: Ninguno (dejar vacío)
   - **Table settings**: Default settings o Customize settings
   - **Read/write capacity settings**: On-demand (recomendado para desarrollo)
4. Click "Create table"

**Nota**: La aplicación usa `Scan` para buscar por `sessionString` y `alumnoId`. Para producción, considera crear un Global Secondary Index (GSI) con `sessionString` como partition key para mejor rendimiento.

## Crear Tabla Usando AWS CLI

```bash
aws dynamodb create-table \
  --table-name sesiones-alumnos \
  --attribute-definitions \
    AttributeName=sessionId,AttributeType=S \
  --key-schema \
    AttributeName=sessionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Estructura de Items en la Tabla

Cada sesión almacenada en DynamoDB tiene la siguiente estructura:

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "alumnoId": 1,
  "sessionString": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789...",
  "timestamp": "2025-11-21T12:00:00.000Z",
  "active": true
}
```

### Campos:

- **sessionId** (String, Partition Key): UUID único de la sesión
- **alumnoId** (Number): ID del alumno asociado a la sesión
- **sessionString** (String): Cadena aleatoria de 128 caracteres para verificación
- **timestamp** (String): ISO 8601 timestamp de cuando se creó la sesión
- **active** (Boolean): Estado de la sesión (true = activa, false = cerrada)

## Verificar Tabla Creada

```bash
# Describir tabla
aws dynamodb describe-table --table-name sesiones-alumnos --region us-east-1

# Listar todas las tablas
aws dynamodb list-tables --region us-east-1
```

## Ejemplo de Operaciones

### Insertar Item (Crear Sesión)

```bash
aws dynamodb put-item \
  --table-name sesiones-alumnos \
  --item '{
    "sessionId": {"S": "550e8400-e29b-41d4-a716-446655440000"},
    "alumnoId": {"N": "1"},
    "sessionString": {"S": "AbCdEf123..."},
    "timestamp": {"S": "2025-11-21T12:00:00.000Z"},
    "active": {"BOOL": true}
  }' \
  --region us-east-1
```

### Obtener Item (Verificar Sesión)

```bash
aws dynamodb get-item \
  --table-name sesiones-alumnos \
  --key '{
    "sessionId": {"S": "550e8400-e29b-41d4-a716-446655440000"}
  }' \
  --region us-east-1
```

### Actualizar Item (Logout)

```bash
aws dynamodb update-item \
  --table-name sesiones-alumnos \
  --key '{
    "sessionId": {"S": "550e8400-e29b-41d4-a716-446655440000"}
  }' \
  --update-expression "SET active = :val" \
  --expression-attribute-values '{
    ":val": {"BOOL": false}
  }' \
  --region us-east-1
```

### Scan (Listar Todas las Sesiones)

```bash
aws dynamodb scan \
  --table-name sesiones-alumnos \
  --region us-east-1
```

## Configuración de Capacidad

### On-Demand (Recomendado para Desarrollo)
- No necesitas planificar capacidad
- Pagas solo por lo que usas
- Ideal para cargas de trabajo impredecibles

### Provisioned (Para Producción con Tráfico Conocido)
- Especificas RCU (Read Capacity Units) y WCU (Write Capacity Units)
- Más económico para tráfico predecible y constante
- Auto-scaling disponible

**Cambiar a Provisioned:**
```bash
aws dynamodb update-table \
  --table-name sesiones-alumnos \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

## TTL (Time To Live) - Opcional

Para eliminar automáticamente sesiones antiguas:

1. Agrega un campo `expirationTime` (Number, Unix timestamp)
2. Habilita TTL en DynamoDB Console o con CLI:

```bash
aws dynamodb update-time-to-live \
  --table-name sesiones-alumnos \
  --time-to-live-specification "Enabled=true, AttributeName=expirationTime" \
  --region us-east-1
```

3. Al crear sesiones, agrega:
```typescript
expirationTime: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
```

## Índices Secundarios (Opcional)

Para consultar sesiones por alumnoId:

```bash
aws dynamodb update-table \
  --table-name sesiones-alumnos \
  --attribute-definitions \
    AttributeName=alumnoId,AttributeType=N \
  --global-secondary-index-updates '[
    {
      "Create": {
        "IndexName": "alumnoId-index",
        "KeySchema": [
          {"AttributeName": "alumnoId", "KeyType": "HASH"}
        ],
        "Projection": {"ProjectionType": "ALL"},
        "ProvisionedThroughput": {
          "ReadCapacityUnits": 5,
          "WriteCapacityUnits": 5
        }
      }
    }
  ]' \
  --region us-east-1
```

## Monitoreo

Ver métricas en CloudWatch:
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- UserErrors
- SystemErrors

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=sesiones-alumnos \
  --start-time 2025-11-21T00:00:00Z \
  --end-time 2025-11-21T23:59:59Z \
  --period 3600 \
  --statistics Sum \
  --region us-east-1
```

## Backup y Restore

### Backup On-Demand

```bash
aws dynamodb create-backup \
  --table-name sesiones-alumnos \
  --backup-name sesiones-backup-2025-11-21 \
  --region us-east-1
```

### Point-in-Time Recovery (PITR)

```bash
aws dynamodb update-continuous-backups \
  --table-name sesiones-alumnos \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
  --region us-east-1
```

## Costos Estimados

### On-Demand
- Write: $1.25 por millón de write requests
- Read: $0.25 por millón de read requests
- Storage: $0.25 por GB-mes

**Ejemplo**: 10,000 sesiones/día
- Writes: 10,000 × 30 = 300,000/mes = $0.375
- Reads: 30,000 × 30 = 900,000/mes = $0.225
- Storage: 1 GB = $0.25
- **Total**: ~$0.85/mes

### Provisioned (5 RCU / 5 WCU)
- Capacidad: $0.00065/hora por RCU + $0.00065/hora por WCU
- 5 RCU = $2.37/mes
- 5 WCU = $2.37/mes
- **Total**: ~$4.74/mes + storage

## Seguridad

### IAM Policy Recomendada

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/sesiones-alumnos"
    }
  ]
}
```

### Encriptación

DynamoDB encripta datos en reposo por defecto. Para mayor seguridad:

```bash
aws dynamodb update-table \
  --table-name sesiones-alumnos \
  --sse-specification Enabled=true,SSEType=KMS,KMSMasterKeyId=alias/aws/dynamodb \
  --region us-east-1
```

## Eliminar Tabla

⚠️ **CUIDADO**: Esta acción es irreversible

```bash
aws dynamodb delete-table \
  --table-name sesiones-alumnos \
  --region us-east-1
```

## Troubleshooting

### Error: ResourceNotFoundException
- La tabla no existe o el nombre es incorrecto
- Verifica que estás usando la región correcta

### Error: ValidationException
- Verifica que sessionId es String
- Verifica formato de los items

### Error: ProvisionedThroughputExceededException
- Aumenta RCU/WCU o cambia a On-Demand
- Implementa exponential backoff en tu código

### Error: AccessDeniedException
- Verifica IAM policy
- Verifica que las credenciales son correctas
