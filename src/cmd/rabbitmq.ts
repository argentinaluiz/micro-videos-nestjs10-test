import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { applyGlobalConfig } from '../global-config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  //applyGlobalConfig(app);
  //app.

  await app.init();
}
bootstrap();
