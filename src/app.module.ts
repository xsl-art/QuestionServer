import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuestionModule } from './question/question.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AnswerModule } from './answer/answer.module';
import { AuthGuard } from './auth/auth.guard';
import { StatModule } from './stat/stat.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    QuestionModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ??
        process.env.MONGO_URL ??
        `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}`,
    ),
    UserModule,
    AuthModule,
    AnswerModule,
    StatModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD, // 全局守卫
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
