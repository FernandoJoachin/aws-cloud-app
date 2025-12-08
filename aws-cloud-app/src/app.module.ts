import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AlumnoModule } from './alumno/alumno.module';
import { ProfesorModule } from './profesor/profesor.module';
import { Alumno } from './alumno/entities/alumno.entity';
import { Profesor } from './profesor/entities/profesor.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Conexión a PostgreSQL: RDS (AWS) o Supabase (desarrollo)
        // 
        // RDS (comentado - requiere credenciales AWS y security group abierto):
        // const dbHost = 'sicei-db.cpw8zukr44tj.us-east-1.rds.amazonaws.com';
        // const dbPort = 5432;
        // const dbUsername = 'postgres';
        // const dbPassword = 'XNMZM8z47RZmxrj';
        // const dbDatabase = 'sicei';
        //
        // Supabase (desarrollo - accesible sin config de red):
        // https://app.supabase.com/project/[PROJECT_ID]/settings/database
        //
        // Para cambiar a RDS: descomentar arriba y cambiar host, credentials en .env
        // Para cambiar a Supabase: llenar DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE en .env

        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: Number(configService.get('DB_PORT')) || 5432,
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [Alumno, Profesor],
          synchronize: true, // Solo para desarrollo, desactivar en producción
          logging: false,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
      inject: [ConfigService],
    }),
    AlumnoModule,
    ProfesorModule,
  ],
})
export class AppModule {}
