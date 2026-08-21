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
    origin: (origin, callback) => {
      // 允许所有来源或指定域名
      const allowedOrigins = [
        'https://questionnaire-kir14.vercel.app',
        'https://question-client-pearl.vercel.app',
        'https://questionnaire-8ncgawweo-kir14.vercel.app/',
        'https://questionnaire-git-main-kir14.vercel.app/',
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      // 允许无 origin 的请求（如 Postman）或允许的域名
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  const port = process.env.PORT ?? 3005;
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
