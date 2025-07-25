import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.urlencoded({ extended: true }));

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: (origin, callback) => {
      // Autorise localhost, tous les sous-domaines de dev et le domaine prod
      const allowedOrigins = [
        /^http:\/\/localhost:\d+$/,
        /^https:\/\/petricator(-dev)?-\d+\.us-central1\.run\.app$/,
        /^https:\/\/[a-zA-Z0-9-]+-812288085862\.us-central1\.run\.app$/,
      ];
      if (!origin || allowedOrigins.some((regex) => regex.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Papi User API')
    .setDescription("API pour la gestion des utilisateurs et points d'action")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
void bootstrap();
