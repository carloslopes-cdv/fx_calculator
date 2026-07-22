import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Treasury FX Risk Management API')
    .setDescription(
      'API de Tesouraria Corporativa para Gestão de Risco Cambial, Anti-Overhedging, Mark-to-Market (MtM) e Alertas.',
    )
    .setVersion('1.0.0')
    .addTag('Books', 'Gestão de Carteiras de Tesouraria')
    .addTag('Trades', 'Gestão de Operações de Câmbio')
    .addTag('Hedges', 'Gestão de Proteções Cambiais')
    .addTag('Risk', 'Motor de Risco, PnL e Mark-to-Market')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port);
}
void bootstrap();
