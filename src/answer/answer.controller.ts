import { Body, Controller, Post } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { Answer } from './schemas/anser.schema';
import { Public } from '../auth/decorators/public.decorator';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Public()
  @Post()
  async create(@Body() body: Answer) {
    return this.answerService.createAnswer(body);
  }
}
