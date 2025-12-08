# Checklist de Configuración - AWS Cloud App

## ☑️ Lista de Verificación Antes de Ejecutar

### 1. Dependencias Node.js
- [ ] Node.js 18+ instalado
- [ ] npm actualizado
- [ ] Ejecutado `npm install`
- [ ] Compilación exitosa con `npm run build`

### 2. AWS Account Setup
- [ ] Cuenta AWS creada y activa
- [ ] Tarjeta de crédito registrada
- [ ] Región AWS seleccionada (recomendado: us-east-1)

### 3. RDS PostgreSQL
- [ ] Instancia RDS PostgreSQL creada
- [ ] DB Instance disponible (status: available)
- [ ] Security Group permite conexión desde tu IP en puerto 5432
- [ ] Public accessibility habilitado
- [ ] Base de datos creada
- [ ] Credenciales guardadas (username, password)
- [ ] Endpoint copiado
- [ ] Probada conexión con `psql` o cliente PostgreSQL

Variables .env necesarias:
```
DB_HOST=
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
```

### 4. IAM User
- [ ] Usuario IAM creado
- [ ] Acceso programático habilitado
- [ ] Policy personalizada creada con permisos para S3, SNS, DynamoDB
- [ ] Access Key ID guardada
- [ ] Secret Access Key guardada
- [ ] AWS CLI configurada (opcional pero recomendado)

Variables .env necesarias:
```
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### 5. S3 Bucket
- [ ] Bucket S3 creado con nombre único
- [ ] "Block all public access" DESACTIVADO
- [ ] Bucket Policy configurada para permitir GetObject público
- [ ] Región del bucket anotada
- [ ] Probada subida manual de archivo

Variables .env necesarias:
```
S3_BUCKET_NAME=
S3_BUCKET_REGION=
```

Comando de prueba:
```bash
aws s3 cp test.jpg s3://TU_BUCKET/test.jpg --acl public-read
```

### 6. SNS Topic
- [ ] Topic SNS creado (tipo: Standard)
- [ ] Suscripción Email creada
- [ ] Email de confirmación recibido
- [ ] Suscripción CONFIRMADA (estado: Confirmed)
- [ ] ARN del topic copiado
- [ ] Probado envío manual de mensaje

Variables .env necesarias:
```
SNS_TOPIC_ARN=
```

Comando de prueba:
```bash
aws sns publish --topic-arn TU_ARN --message "Test"
```

### 7. DynamoDB Table
- [ ] Tabla `sesiones-alumnos` creada
- [ ] Partition key: `sessionId` (String) - verificar mayúsculas/minúsculas
- [ ] Sin Sort key
- [ ] Billing mode seleccionado (On-demand o Provisioned)
- [ ] Tabla en estado Active
- [ ] Región anotada
- [ ] Probada operación Put manual

Variables .env necesarias:
```
DYNAMODB_TABLE_NAME=sesiones-alumnos
DYNAMODB_REGION=
```

Comando de prueba:
```bash
aws dynamodb describe-table --table-name sesiones-alumnos --region TU_REGION
```

### 8. Archivo .env
- [ ] Archivo `.env` creado (copiado desde `.env.example`)
- [ ] Todas las variables completadas (sin valores vacíos)
- [ ] Archivo `.env` NO está en git (verificar `.gitignore`)

### 9. Verificación de Permisos IAM
Policy JSON debe incluir:
- [ ] `s3:PutObject` en resource del bucket
- [ ] `s3:PutObjectAcl` en resource del bucket
- [ ] `sns:Publish` en resource del topic
- [ ] `dynamodb:PutItem` en resource de la tabla
- [ ] `dynamodb:GetItem` en resource de la tabla
- [ ] `dynamodb:UpdateItem` en resource de la tabla

### 10. Network y Firewall
- [ ] Security Group de RDS permite puerto 5432 desde tu IP
- [ ] Firewall local permite conexiones salientes a AWS
- [ ] VPN/Proxy configurado si es necesario

## 🚀 Ejecución

### Primer Inicio
```bash
# 1. Instalar dependencias
npm install

# 2. Verificar compilación
npm run build

# 3. Iniciar en modo desarrollo
npm run start:dev
```

### Verificar que la Aplicación Inició
Deberías ver:
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] INFO [InstanceLoader] ConfigModule dependencies initialized
...
[Nest] INFO [NestApplication] Nest application successfully started
```

### Probar Conexión a la Base de Datos
La aplicación debería conectarse automáticamente. Si hay error, revisar:
- Credenciales en `.env`
- Security Group de RDS
- Que la instancia RDS esté running

## 🧪 Pruebas Iniciales

### 1. Health Check
```bash
curl http://localhost:3000/alumnos
# Debe retornar: []
```

### 2. Crear Primer Alumno
```bash
curl -X POST http://localhost:3000/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Test",
    "apellidos": "Usuario",
    "matricula": "A00000001",
    "promedio": 8.0,
    "password": "test123"
  }'
```

### 3. Verificar en RDS
Conectarse a RDS y verificar:
```sql
SELECT * FROM alumnos;
```

### 4. Probar S3 (requiere imagen)
```bash
curl -X POST http://localhost:3000/alumnos/1/fotoPerfil \
  -F "foto=@test.jpg"
```

### 5. Probar SNS
```bash
curl -X POST http://localhost:3000/alumnos/1/email
```
Verificar que llegue el email.

### 6. Probar DynamoDB (Login)
```bash
curl -X POST http://localhost:3000/alumnos/1/session/login \
  -H "Content-Type: application/json" \
  -d '{"password": "test123"}'
```

## ❌ Troubleshooting Común

### Error: Cannot connect to database
- [ ] Verificar Security Group permite tu IP
- [ ] Verificar credenciales en `.env`
- [ ] Verificar que RDS está en estado "available"
- [ ] Probar conexión con `psql` directamente

### Error: S3 Access Denied
- [ ] Verificar IAM policy incluye s3:PutObject
- [ ] Verificar nombre del bucket es correcto
- [ ] Verificar región es correcta
- [ ] Verificar Access Key ID y Secret son válidas

### Error: SNS no envía emails
- [ ] Verificar suscripción está "Confirmed"
- [ ] Verificar ARN del topic es correcto
- [ ] Revisar spam/junk mail
- [ ] Verificar IAM policy incluye sns:Publish

### Error: DynamoDB ResourceNotFoundException
- [ ] Verificar nombre de tabla es exactamente "sesiones-alumnos"
- [ ] Verificar región es correcta
- [ ] Verificar tabla existe con `aws dynamodb list-tables`

### Error: Validation failed
- [ ] Verificar formato JSON es correcto
- [ ] Verificar todos los campos requeridos están presentes
- [ ] Verificar tipos de datos (promedio es número, no string)

## 📊 Verificación Post-Despliegue

### Base de Datos
```bash
# Listar tablas creadas por TypeORM
psql -h TU_HOST -U TU_USER -d TU_DB -c "\dt"
# Deberías ver: alumnos, profesores
```

### S3
```bash
# Listar archivos subidos
aws s3 ls s3://TU_BUCKET/
```

### DynamoDB
```bash
# Ver sesiones activas
aws dynamodb scan --table-name sesiones-alumnos --region TU_REGION
```

### SNS
```bash
# Ver suscripciones
aws sns list-subscriptions-by-topic --topic-arn TU_ARN
```

## 🎯 Criterios de Aceptación

Tu implementación está lista cuando:
- [ ] ✅ Aplicación compila sin errores
- [ ] ✅ Aplicación inicia sin errores
- [ ] ✅ Puede crear alumno vía POST
- [ ] ✅ Puede listar alumnos vía GET
- [ ] ✅ Puede subir foto y se guarda en S3
- [ ] ✅ Puede enviar email y se recibe
- [ ] ✅ Puede hacer login y se crea sesión en DynamoDB
- [ ] ✅ Puede verificar sesión válida
- [ ] ✅ Puede hacer logout y sesión se invalida
- [ ] ✅ Puede crear y listar profesores
- [ ] ✅ Los IDs son autogenerados por la base de datos

## 📝 Logs y Monitoreo

### Ver Logs de la Aplicación
```bash
npm run start:dev
# Los logs aparecen en consola
```

### Ver Logs de AWS (CloudWatch)
- RDS: Cloudwatch → Log groups → /aws/rds/instance/TU_INSTANCIA
- Lambda (si usas): CloudWatch → Log groups → /aws/lambda/FUNCION
- Application Logs: Considera implementar Winston + CloudWatch

## 💰 Estimación de Costos

Con uso moderado (desarrollo):
- RDS db.t3.micro: ~$15/mes
- S3: ~$1/mes
- SNS: ~$0.5/mes
- DynamoDB On-demand: ~$1/mes
- **Total: ~$17.5/mes**

Para minimizar costos:
- [ ] Detener instancia RDS cuando no la uses
- [ ] Usar Free Tier donde sea posible
- [ ] Configurar alarmas de billing en AWS
- [ ] Eliminar recursos cuando termines el proyecto

## 🔐 Seguridad

Antes de ir a producción:
- [ ] Cambiar `synchronize: true` a `false` en TypeORM
- [ ] Implementar autenticación JWT
- [ ] Configurar CORS apropiadamente
- [ ] Usar HTTPS
- [ ] Rotar credenciales regularmente
- [ ] Habilitar MFA en cuenta AWS
- [ ] Usar AWS Secrets Manager para credenciales
- [ ] Implementar rate limiting
- [ ] Configurar WAF si es público

## ✅ Checklist Final

Antes de entregar el proyecto:
- [ ] Todo el código compila sin errores
- [ ] Todos los endpoints funcionan
- [ ] Documentación actualizada
- [ ] `.env` NO está commiteado
- [ ] `.env.example` está actualizado
- [ ] README incluye instrucciones claras
- [ ] Postman collection funciona
- [ ] Scripts de prueba funcionan
- [ ] Costos AWS estimados documentados

## 🎓 Entrega del Proyecto

Incluir en tu entrega:
1. Código fuente (repositorio Git)
2. Archivo `.env.example` completo
3. Capturas de pantalla de:
   - Instancia RDS activa
   - Bucket S3 con archivos
   - Topic SNS con suscripción confirmada
   - Tabla DynamoDB con datos
   - Postman/curl mostrando endpoints funcionando
4. Video demo (opcional pero recomendado)
5. Documentación de configuración

## 📞 Ayuda

Si tienes problemas:
1. Revisa logs de la aplicación
2. Revisa CloudWatch logs en AWS
3. Verifica cada servicio AWS individualmente con AWS CLI
4. Consulta `CONFIGURACION.md` y `DYNAMODB_SETUP.md`
5. Usa `TEST_SCRIPTS.md` para aislar problemas

---

**¡Éxito con tu proyecto! 🚀**
