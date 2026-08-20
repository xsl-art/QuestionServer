import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionService } from '../question/question.service';
import { AnswerService } from '../answer/answer.service';

export interface PageStatisticsResult {
  total: number;
  list: { _id: string; [key: string]: any }[];
}

export interface ChartStatisticsResult {
  stat: { name: string; count: number }[];
}

@Injectable()
export class StatService {
  constructor(
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
  ) {}

  async getPageStatistics(
    questionId: string,
    page: number,
    pageSize: number,
  ): Promise<PageStatisticsResult> {
    const question = await this.questionService.findOne(questionId);
    if (!question) {
      throw new NotFoundException('问卷不存在');
    }

    const [total, answers] = await Promise.all([
      this.answerService.count(questionId),
      this.answerService.findAll(questionId, { page, pageSize }),
    ]);

    const list = answers.map((answer) =>
      this.answerService.transformAnswerToRow(answer),
    );

    return { total, list };
  }

  async getChartStatistics(
    questionId: string,
    componentId: string,
  ): Promise<ChartStatisticsResult> {
    const question = await this.questionService.findOne(questionId);
    if (!question) {
      throw new NotFoundException('问卷不存在');
    }

    const stat = await this.answerService.getComponentStat(
      questionId,
      componentId,
    );
    return { stat };
  }
}
