import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // allow cross-origin requests from frontend

  const config = new DocumentBuilder()
    .setTitle('Smart Tracker API')
    .setDescription('API documentation for the Smart Tracker application')
    .setVersion('1.0')
    .addTag('flights')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
