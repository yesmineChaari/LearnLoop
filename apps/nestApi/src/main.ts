/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SkillsService } from './skills/skills.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';
  app.enableCors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  const shouldSeedDefaultData =
    (process.env.SEED_DEFAULT_DATA ?? 'true').toLowerCase() === 'true';
  if (shouldSeedDefaultData) {
    const skillsService = app.get(SkillsService);
    await skillsService.seedDefaults();
    Logger.log('Default skills are ensured in the database.');
  }

  // Validation is applied locally in specific controllers/routes

  await app.listen(port);
  Logger.log(
    ` Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
