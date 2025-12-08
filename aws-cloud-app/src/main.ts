import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.enableCors();
  await app.listen(8080, '0.0.0.0');
  console.log('🚀 Server running on http://localhost:8080');
}
bootstrap();
