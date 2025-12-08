# Script de Prueba Rápida - Verificación de Tests

Este script prueba los escenarios principales que validan los tests de Java.

## Variables
```bash
API_URL="http://localhost:3000"
```

## 1. Test: POST Alumno debe retornar 201

```bash
# Debe retornar status 201 (Created)
curl -i -X POST $API_URL/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Test",
    "apellidos": "Usuario",
    "matricula": "A00999999",
    "promedio": 8.5,
    "password": "test123456"
  }'

# Verificar: HTTP/1.1 201 Created
```

## 2. Test: Login con Password Incorrecto debe retornar 400

```bash
# Primero crear alumno y obtener ID
ALUMNO_RESPONSE=$(curl -s -X POST $API_URL/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Test",
    "apellidos": "Login",
    "matricula": "A00999998",
    "promedio": 8.0,
    "password": "correctpass"
  }')

ALUMNO_ID=$(echo $ALUMNO_RESPONSE | jq -r '.id')

# Intentar login con password incorrecto
curl -i -X POST $API_URL/alumnos/$ALUMNO_ID/session/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "wrongpassword"
  }'

# Verificar: HTTP/1.1 400 Bad Request
```

## 3. Test: Login Exitoso retorna sessionString de 128 caracteres

```bash
# Login exitoso
SESSION_RESPONSE=$(curl -s -X POST $API_URL/alumnos/$ALUMNO_ID/session/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "correctpass"
  }')

echo $SESSION_RESPONSE | jq .

SESSION_STRING=$(echo $SESSION_RESPONSE | jq -r '.sessionString')
echo "Session String Length: ${#SESSION_STRING}"

# Verificar: Length debe ser 128
```

## 4. Test: Verificar Sesión Válida retorna 200

```bash
curl -i -X POST $API_URL/alumnos/$ALUMNO_ID/session/verify \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionString\": \"$SESSION_STRING\"
  }"

# Verificar: HTTP/1.1 200 OK
# Body: {"valid":true}
```

## 5. Test: Verificar Sesión Inválida retorna 400

```bash
curl -i -X POST $API_URL/alumnos/$ALUMNO_ID/session/verify \
  -H "Content-Type: application/json" \
  -d '{
    "sessionString": "InvalidSessionString123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012"
  }'

# Verificar: HTTP/1.1 400 Bad Request
```

## 6. Test: Logout invalida la sesión

```bash
# Primero verificar que la sesión es válida
curl -s -X POST $API_URL/alumnos/$ALUMNO_ID/session/verify \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionString\": \"$SESSION_STRING\"
  }" | jq .

# Hacer logout
curl -i -X POST $API_URL/alumnos/$ALUMNO_ID/session/logout \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionString\": \"$SESSION_STRING\"
  }"

# Verificar: HTTP/1.1 200 OK
# Body: {"loggedOut":true}

# Intentar verificar la sesión después del logout (debe fallar)
curl -i -X POST $API_URL/alumnos/$ALUMNO_ID/session/verify \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionString\": \"$SESSION_STRING\"
  }"

# Verificar: HTTP/1.1 400 Bad Request
```

## 7. Test: POST Profesor debe retornar 201

```bash
curl -i -X POST $API_URL/profesores \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Test",
    "apellidos": "Profesor",
    "numeroEmpleado": 99999,
    "horasClase": 20
  }'

# Verificar: HTTP/1.1 201 Created
```

## 8. Test: Validación de Campos Incorrectos retorna 400

```bash
# Alumno con campos inválidos
curl -i -X POST $API_URL/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "",
    "apellidos": null,
    "matricula": "123",
    "promedio": 11.5
  }'

# Verificar: HTTP/1.1 400 Bad Request

# Profesor con campos inválidos
curl -i -X POST $API_URL/profesores \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "",
    "apellidos": null,
    "numeroEmpleado": -123,
    "horasClase": -5
  }'

# Verificar: HTTP/1.1 400 Bad Request
```

## Script Completo Automatizado (Bash)

```bash
#!/bin/bash

API_URL="http://localhost:3000"
PASSED=0
FAILED=0

echo "=== Test Suite - AWS Cloud App ==="
echo ""

# Test 1: POST Alumno retorna 201
echo "Test 1: POST Alumno retorna 201..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Test1",
    "apellidos": "Usuario",
    "matricula": "A'$(date +%s)'",
    "promedio": 8.5,
    "password": "test123456"
  }')

if [ "$STATUS" -eq 201 ]; then
  echo "✅ PASSED: Status code 201"
  ((PASSED++))
else
  echo "❌ FAILED: Expected 201, got $STATUS"
  ((FAILED++))
fi
echo ""

# Test 2: Login con password incorrecto retorna 400
echo "Test 2: Login con password incorrecto retorna 400..."
ALUMNO_RESPONSE=$(curl -s -X POST $API_URL/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Test2",
    "apellidos": "Login",
    "matricula": "A'$(date +%s)'",
    "promedio": 8.0,
    "password": "correctpass"
  }')

ALUMNO_ID=$(echo $ALUMNO_RESPONSE | jq -r '.id')

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/alumnos/$ALUMNO_ID/session/login \
  -H "Content-Type: application/json" \
  -d '{"password": "wrongpassword"}')

if [ "$STATUS" -eq 400 ]; then
  echo "✅ PASSED: Status code 400"
  ((PASSED++))
else
  echo "❌ FAILED: Expected 400, got $STATUS"
  ((FAILED++))
fi
echo ""

# Test 3: Login exitoso retorna sessionString de 128 chars
echo "Test 3: Login exitoso retorna sessionString de 128 caracteres..."
SESSION_RESPONSE=$(curl -s -X POST $API_URL/alumnos/$ALUMNO_ID/session/login \
  -H "Content-Type: application/json" \
  -d '{"password": "correctpass"}')

SESSION_STRING=$(echo $SESSION_RESPONSE | jq -r '.sessionString')
LENGTH=${#SESSION_STRING}

if [ "$LENGTH" -eq 128 ]; then
  echo "✅ PASSED: sessionString length = 128"
  ((PASSED++))
else
  echo "❌ FAILED: Expected 128, got $LENGTH"
  ((FAILED++))
fi
echo ""

# Test 4: Verificar sesión válida retorna 200
echo "Test 4: Verificar sesión válida retorna 200..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/alumnos/$ALUMNO_ID/session/verify \
  -H "Content-Type: application/json" \
  -d "{\"sessionString\": \"$SESSION_STRING\"}")

if [ "$STATUS" -eq 200 ]; then
  echo "✅ PASSED: Status code 200"
  ((PASSED++))
else
  echo "❌ FAILED: Expected 200, got $STATUS"
  ((FAILED++))
fi
echo ""

# Test 5: Verificar sesión inválida retorna 400
echo "Test 5: Verificar sesión inválida retorna 400..."
INVALID_SESSION=$(printf 'X%.0s' {1..128})
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/alumnos/$ALUMNO_ID/session/verify \
  -H "Content-Type: application/json" \
  -d "{\"sessionString\": \"$INVALID_SESSION\"}")

if [ "$STATUS" -eq 400 ]; then
  echo "✅ PASSED: Status code 400"
  ((PASSED++))
else
  echo "❌ FAILED: Expected 400, got $STATUS"
  ((FAILED++))
fi
echo ""

# Test 6: Logout invalida la sesión
echo "Test 6: Logout invalida la sesión..."
curl -s -X POST $API_URL/alumnos/$ALUMNO_ID/session/logout \
  -H "Content-Type: application/json" \
  -d "{\"sessionString\": \"$SESSION_STRING\"}" > /dev/null

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/alumnos/$ALUMNO_ID/session/verify \
  -H "Content-Type: application/json" \
  -d "{\"sessionString\": \"$SESSION_STRING\"}")

if [ "$STATUS" -eq 400 ]; then
  echo "✅ PASSED: Session invalidated, status code 400"
  ((PASSED++))
else
  echo "❌ FAILED: Expected 400 after logout, got $STATUS"
  ((FAILED++))
fi
echo ""

# Test 7: POST Profesor retorna 201
echo "Test 7: POST Profesor retorna 201..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/profesores \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Test",
    "apellidos": "Profesor",
    "numeroEmpleado": '$(date +%s)',
    "horasClase": 20
  }')

if [ "$STATUS" -eq 201 ]; then
  echo "✅ PASSED: Status code 201"
  ((PASSED++))
else
  echo "❌ FAILED: Expected 201, got $STATUS"
  ((FAILED++))
fi
echo ""

# Resumen
echo "==================================="
echo "Resumen de Tests:"
echo "✅ Pasados: $PASSED"
echo "❌ Fallidos: $FAILED"
echo "==================================="

if [ $FAILED -eq 0 ]; then
  echo "🎉 Todos los tests pasaron!"
  exit 0
else
  echo "⚠️  Algunos tests fallaron"
  exit 1
fi
```

## PowerShell (Windows)

```powershell
$API_URL = "http://localhost:3000"
$PASSED = 0
$FAILED = 0

Write-Host "=== Test Suite - AWS Cloud App ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: POST Alumno retorna 201
Write-Host "Test 1: POST Alumno retorna 201..." -ForegroundColor Yellow
$body = @{
    nombres = "Test1"
    apellidos = "Usuario"
    matricula = "A$(Get-Date -Format 'yyyyMMddHHmmss')"
    promedio = 8.5
    password = "test123456"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_URL/alumnos" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ PASSED: Status code 201" -ForegroundColor Green
        $PASSED++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $FAILED++
}
Write-Host ""

# Test 2: Login con password incorrecto retorna 400
Write-Host "Test 2: Login con password incorrecto retorna 400..." -ForegroundColor Yellow
$body = @{
    nombres = "Test2"
    apellidos = "Login"
    matricula = "A$(Get-Date -Format 'yyyyMMddHHmmss')"
    promedio = 8.0
    password = "correctpass"
} | ConvertTo-Json

$alumno = Invoke-RestMethod -Uri "$API_URL/alumnos" -Method Post -Body $body -ContentType "application/json"
$alumnoId = $alumno.id

$loginBody = @{ password = "wrongpassword" } | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$API_URL/alumnos/$alumnoId/session/login" -Method Post -Body $loginBody -ContentType "application/json" -UseBasicParsing
    Write-Host "❌ FAILED: Should have returned 400" -ForegroundColor Red
    $FAILED++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "✅ PASSED: Status code 400" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "❌ FAILED: Expected 400, got $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        $FAILED++
    }
}
Write-Host ""

# Resumen
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Resumen de Tests:"
Write-Host "✅ Pasados: $PASSED" -ForegroundColor Green
Write-Host "❌ Fallidos: $FAILED" -ForegroundColor Red
Write-Host "===================================" -ForegroundColor Cyan
```

## Notas

- Asegúrate de que la aplicación esté corriendo en `http://localhost:3000`
- Asegúrate de tener `jq` instalado para los scripts bash
- Los tests crean datos de prueba que quedarán en la base de datos
- Para limpiar, puedes eliminar los registros manualmente o recrear la base de datos
