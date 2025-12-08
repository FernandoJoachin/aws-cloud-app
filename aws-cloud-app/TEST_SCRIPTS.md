# Test Scripts - AWS Cloud App

Scripts de prueba usando curl para probar todos los endpoints.

## Variables de Entorno (Opcional)

```bash
export API_URL="http://localhost:3000"
```

## Alumnos

### 1. Crear Alumno

```bash
curl -X POST $API_URL/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "apellidos": "Pérez García",
    "matricula": "A00123456",
    "promedio": 8.5,
    "password": "password123"
  }'
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombres": "Juan",
  "apellidos": "Pérez García",
  "matricula": "A00123456",
  "promedio": 8.5,
  "password": "$2b$10$...",
  "fotoPerfilUrl": null
}
```

### 2. Listar Todos los Alumnos

```bash
curl -X GET $API_URL/alumnos
```

### 3. Obtener Alumno por ID

```bash
curl -X GET $API_URL/alumnos/1
```

### 4. Actualizar Alumno

```bash
curl -X PUT $API_URL/alumnos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "promedio": 9.0,
    "nombres": "Juan Carlos"
  }'
```

### 5. Subir Foto de Perfil (S3)

```bash
curl -X POST $API_URL/alumnos/1/fotoPerfil \
  -F "foto=@/ruta/a/tu/foto.jpg"
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombres": "Juan",
  "apellidos": "Pérez García",
  "matricula": "A00123456",
  "promedio": 8.5,
  "password": "$2b$10$...",
  "fotoPerfilUrl": "https://aws-cloud-app-fotos.s3.us-east-1.amazonaws.com/perfil-1-uuid.jpg"
}
```

### 6. Enviar Email vía SNS

```bash
curl -X POST $API_URL/alumnos/1/email
```

**Respuesta esperada:**
```json
{
  "sent": true
}
```

### 7. Login - Crear Sesión (DynamoDB)

```bash
curl -X POST $API_URL/alumnos/1/session/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123"
  }'
```

**Respuesta esperada:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionString": "AbCdEfGh123...(128 caracteres)",
  "alumnoId": 1,
  "timestamp": "2025-11-21T12:00:00.000Z"
}
```

**⚠️ IMPORTANTE**: Guarda el `sessionId` y `sessionString` para los siguientes pasos.

### 8. Verificar Sesión

```bash
# Reemplaza SESSION_STRING con el valor del login
curl -X POST $API_URL/alumnos/1/session/verify \
  -H "Content-Type: application/json" \
  -d '{
    "sessionString": "SESSION_STRING_AQUI"
  }'
```

**Respuesta esperada (sesión válida):**
```json
{
  "valid": true
}
```

**Respuesta esperada (sesión inválida):**
```json
{
  "valid": false
}
```

### 9. Logout - Cerrar Sesión

```bash
# Reemplaza SESSION_ID con el valor del login
curl -X POST $API_URL/alumnos/1/session/logout \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID_AQUI"
  }'
```

**Respuesta esperada:**
```json
{
  "loggedOut": true
}
```

### 10. Eliminar Alumno

```bash
curl -X DELETE $API_URL/alumnos/1
```

**Respuesta esperada:**
```json
{
  "deleted": true
}
```

---

## Profesores

### 1. Crear Profesor

```bash
curl -X POST $API_URL/profesores \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "María",
    "apellidos": "González López",
    "numeroEmpleado": 12345,
    "horasClase": 20
  }'
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombres": "María",
  "apellidos": "González López",
  "numeroEmpleado": 12345,
  "horasClase": 20
}
```

### 2. Listar Todos los Profesores

```bash
curl -X GET $API_URL/profesores
```

### 3. Obtener Profesor por ID

```bash
curl -X GET $API_URL/profesores/1
```

### 4. Actualizar Profesor

```bash
curl -X PUT $API_URL/profesores/1 \
  -H "Content-Type: application/json" \
  -d '{
    "horasClase": 25
  }'
```

### 5. Eliminar Profesor

```bash
curl -X DELETE $API_URL/profesores/1
```

---

## Flujo Completo de Prueba

Script completo para probar toda la funcionalidad:

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "=== Test AWS Cloud App ==="
echo ""

# 1. Crear Alumno
echo "1. Creando alumno..."
ALUMNO=$(curl -s -X POST $API_URL/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "apellidos": "Pérez",
    "matricula": "A00123456",
    "promedio": 8.5,
    "password": "password123"
  }')
ALUMNO_ID=$(echo $ALUMNO | jq -r '.id')
echo "Alumno creado con ID: $ALUMNO_ID"
echo ""

# 2. Listar Alumnos
echo "2. Listando alumnos..."
curl -s -X GET $API_URL/alumnos | jq
echo ""

# 3. Subir Foto (requiere archivo)
echo "3. Para subir foto, ejecuta:"
echo "curl -X POST $API_URL/alumnos/$ALUMNO_ID/fotoPerfil -F \"foto=@foto.jpg\""
echo ""

# 4. Enviar Email
echo "4. Enviando email..."
curl -s -X POST $API_URL/alumnos/$ALUMNO_ID/email | jq
echo ""

# 5. Login
echo "5. Haciendo login..."
SESSION=$(curl -s -X POST $API_URL/alumnos/$ALUMNO_ID/session/login \
  -H "Content-Type: application/json" \
  -d '{"password": "password123"}')
SESSION_ID=$(echo $SESSION | jq -r '.sessionId')
SESSION_STRING=$(echo $SESSION | jq -r '.sessionString')
echo "Session ID: $SESSION_ID"
echo "Session String: ${SESSION_STRING:0:20}..."
echo ""

# 6. Verificar Sesión
echo "6. Verificando sesión..."
curl -s -X POST $API_URL/alumnos/$ALUMNO_ID/session/verify \
  -H "Content-Type: application/json" \
  -d "{\"sessionString\": \"$SESSION_STRING\"}" | jq
echo ""

# 7. Logout
echo "7. Haciendo logout..."
curl -s -X POST $API_URL/alumnos/$ALUMNO_ID/session/logout \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION_ID\"}" | jq
echo ""

# 8. Verificar sesión después de logout
echo "8. Verificando sesión después de logout..."
curl -s -X POST $API_URL/alumnos/$ALUMNO_ID/session/verify \
  -H "Content-Type: application/json" \
  -d "{\"sessionString\": \"$SESSION_STRING\"}" | jq
echo ""

# 9. Crear Profesor
echo "9. Creando profesor..."
PROFESOR=$(curl -s -X POST $API_URL/profesores \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "María",
    "apellidos": "González",
    "numeroEmpleado": 12345,
    "horasClase": 20
  }')
PROFESOR_ID=$(echo $PROFESOR | jq -r '.id')
echo "Profesor creado con ID: $PROFESOR_ID"
echo ""

# 10. Listar Profesores
echo "10. Listando profesores..."
curl -s -X GET $API_URL/profesores | jq
echo ""

echo "=== Test Completado ==="
```

**Para ejecutar el script:**

1. Guarda como `test.sh`
2. Dale permisos: `chmod +x test.sh`
3. Ejecuta: `./test.sh`

**Requisitos:**
- `curl` instalado
- `jq` instalado (para formatear JSON): `apt install jq` o `brew install jq`

---

## PowerShell (Windows)

Para usuarios de Windows con PowerShell:

```powershell
$API_URL = "http://localhost:3000"

# Crear Alumno
$body = @{
    nombres = "Juan"
    apellidos = "Pérez"
    matricula = "A00123456"
    promedio = 8.5
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$API_URL/alumnos" -Method Post -Body $body -ContentType "application/json"
$alumnoId = $response.id
Write-Host "Alumno creado con ID: $alumnoId"

# Login
$loginBody = @{
    password = "password123"
} | ConvertTo-Json

$session = Invoke-RestMethod -Uri "$API_URL/alumnos/$alumnoId/session/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "Session ID: $($session.sessionId)"
Write-Host "Session String: $($session.sessionString.Substring(0,20))..."

# Verificar Sesión
$verifyBody = @{
    sessionString = $session.sessionString
} | ConvertTo-Json

$verify = Invoke-RestMethod -Uri "$API_URL/alumnos/$alumnoId/session/verify" -Method Post -Body $verifyBody -ContentType "application/json"
Write-Host "Sesión válida: $($verify.valid)"
```

---

## Casos de Error

### Password Incorrecto (Login)

```bash
curl -X POST $API_URL/alumnos/1/session/login \
  -H "Content-Type: application/json" \
  -d '{"password": "wrong_password"}'
```

**Respuesta esperada (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid password",
  "error": "Unauthorized"
}
```

### Alumno No Encontrado

```bash
curl -X GET $API_URL/alumnos/999
```

**Respuesta esperada (404):**
```json
{
  "statusCode": 404,
  "message": "Not Found"
}
```

### Validación Fallida

```bash
curl -X POST $API_URL/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "promedio": 11
  }'
```

**Respuesta esperada (400):**
```json
{
  "statusCode": 400,
  "message": [
    "apellidos should not be empty",
    "promedio must not be greater than 10"
  ],
  "error": "Bad Request"
}
```

---

## Verificar Servicios AWS

### S3 - Verificar que la foto se subió

```bash
aws s3 ls s3://aws-cloud-app-fotos/
```

### DynamoDB - Ver sesiones

```bash
aws dynamodb scan --table-name sesiones-alumnos --region us-east-1
```

### CloudWatch - Ver logs de SNS

```bash
aws logs tail /aws/sns/us-east-1/ACCOUNT_ID/alumno-notifications --follow
```

---

## Tips de Depuración

### Verbose Mode (curl)

```bash
curl -v -X POST $API_URL/alumnos/1/fotoPerfil \
  -F "foto=@foto.jpg"
```

### Ver Headers de Respuesta

```bash
curl -i -X GET $API_URL/alumnos
```

### Guardar Respuesta en Archivo

```bash
curl -X GET $API_URL/alumnos > alumnos.json
```

### Timing de Request

```bash
curl -w "\nTiempo total: %{time_total}s\n" -X GET $API_URL/alumnos
```
