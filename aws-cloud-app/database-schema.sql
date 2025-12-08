-- Este archivo es solo de referencia para la estructura de PostgreSQL
-- TypeORM creará automáticamente las tablas con synchronize: true

-- Tabla de Alumnos
-- CREATE TABLE alumnos (
--   id SERIAL PRIMARY KEY,
--   nombres VARCHAR(255) NOT NULL,
--   apellidos VARCHAR(255) NOT NULL,
--   matricula VARCHAR(255) UNIQUE NOT NULL,
--   promedio DECIMAL(3,2) NOT NULL,
--   password VARCHAR(255) NOT NULL,
--   fotoPerfilUrl VARCHAR(500)
-- );

-- Tabla de Profesores
-- CREATE TABLE profesores (
--   id SERIAL PRIMARY KEY,
--   nombres VARCHAR(255) NOT NULL,
--   apellidos VARCHAR(255) NOT NULL,
--   numeroEmpleado INTEGER UNIQUE NOT NULL,
--   horasClase INTEGER NOT NULL
-- );

-- Índices opcionales para mejorar rendimiento
-- CREATE INDEX idx_alumnos_matricula ON alumnos(matricula);
-- CREATE INDEX idx_profesores_numero ON profesores(numeroEmpleado);

-- Nota: DynamoDB usa una estructura NoSQL diferente
-- Ver DYNAMODB_SETUP.md para instrucciones de DynamoDB
