import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  const port = 4000;
  await app.listen(port);
  console.log(`🏥 Hospital Core API running on http://localhost:${port}/api/v1`);
  console.log(`Endpoints: /patients, /appointments, /beds, /billing`);
}
bootstrap();