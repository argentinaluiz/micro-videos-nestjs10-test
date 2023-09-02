import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/sequelize';
import { migrator } from './core/shared/infra/db/sequelize/migrator';
import { MigrationModule } from './database/migrations.module';

async function bootstrap() {
  // Standalone application
  const app = await NestFactory.createApplicationContext(MigrationModule, {
    logger: ['error'],
  });
  const sequelize = app.get(getConnectionToken());
  migrator(sequelize).runAsCLI();
}
bootstrap();
