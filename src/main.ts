import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform/transform.interceptor';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new TransformInterceptor()); //全局拦截器
  app.useGlobalFilters(new HttpExceptionFilter()); //全局异常过滤器
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  const port = process.env.PORT ?? 3005;
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
