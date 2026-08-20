import { Module, forwardRef } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from './schemas/anser.schema';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Answer.name, schema: AnswerSchema }]),
    forwardRef(() => QuestionModule),
  ],
  exports: [AnswerService],
  providers: [AnswerService],
  controllers: [AnswerController],
})
export class AnswerModule {}
