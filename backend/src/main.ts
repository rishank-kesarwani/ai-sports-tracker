import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : configService.get<number>('port', 4000);
  const frontendUrlRaw = configService.get<string>('frontendUrl', 'http://localhost:3000');
  const configuredOrigins = frontendUrlRaw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Cookie Parser (resilient for both CommonJS and ES Module interop)
  const cookieMiddleware = typeof cookieParser === 'function' ? cookieParser : (cookieParser as any)?.default;
  if (typeof cookieMiddleware === 'function') {
    app.use(cookieMiddleware());
  }

  // CORS
  app.enableCors({
    origin: [
      ...configuredOrigins,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      /\.vercel\.app$/,
      /\.onrender\.com$/,
      /\.railway\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-api-key',
      'x-correlation-id',
      'Idempotency-Key',
    ],
  });

  // Global Prefix with Health Route Exclusion (for Render Health Checks at /health)
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'api/health'],
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception & Transform Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Sports Tracker API')
    .setDescription(
      'Production-grade REST & Real-time SSE API for AI Sports Tracker with TheSportsDB Provider, Redis Caching, and Shared AI Platform Integration',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Sports', 'Sports catalog, fixtures, leagues, teams, and live events')
    .addTag('Realtime / Live Updates', 'Server-Sent Events match streaming')
    .addTag('AI Sports Intelligence', 'Grounded match analysis and conversational sports assistant')
    .addTag('Authentication', 'JWT authentication, refresh tokens, and password recovery')
    .addTag('Follows & Favorites', 'User sports, team, and league personalization')
    .addTag('Notifications', 'In-app and external push/email dispatch')
    .addTag('Health & Observability', 'Multi-dependency health and liveness telemetry')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AI Sports Tracker - API Specs',
  });

  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 AI Sports Tracker Backend is live at: http://0.0.0.0:${port}/api/v1`);
  logger.log(`📚 Swagger OpenAPI Documentation available at: http://0.0.0.0:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
