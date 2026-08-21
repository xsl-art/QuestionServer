import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform/transform.interceptor';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';

async function bootstrap() {
  console.log('Starting bootstrap...');
  console.log('PORT env:', process.env.PORT);

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

  // 健康检查端点（在 listen 之前注册）
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'ok' });
  });

  const port = process.env.PORT ?? 3005;
  console.log('Listening on port:', port);
  await app.listen(port, '0.0.0.0');
  console.log('Application is running on: http://0.0.0.0:' + port);
}
void bootstrap();
