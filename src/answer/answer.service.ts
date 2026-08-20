import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Answer, AnswerDocument, AnswerListItem } from './schemas/anser.schema';
import { Model } from 'mongoose';
import { QuestionService } from '../question/question.service';

export interface AnswerRow {
  _id: string;
  [key: string]: string | number;
}

@Injectable()
export class AnswerService {
  constructor(
    @InjectModel(Answer.name)
    private readonly answerModel: Model<AnswerDocument>,
    @Inject(forwardRef(() => QuestionService))
    private readonly questionService: QuestionService,
  ) {}

  async createAnswer(answerInfo: Answer) {
    if (!answerInfo.questionId) {
      throw new BadRequestException('questionId is required');
    }

    const question = await this.questionService.findOne(answerInfo.questionId);
    if (!question) {
      throw new BadRequestException('问卷不存在');
    }
    if (question.isDeleted) {
      throw new ForbiddenException('该问卷已被删除');
    }
    if (!question.isPublished) {
      throw new ForbiddenException('该问卷尚未发布，无法提交');
    }

    const answer = new this.answerModel(answerInfo);
    return await answer.save();
  }

  async count(questionId: string) {
    if (!questionId) return 0;
    return await this.answerModel.countDocuments({ questionId });
  }

  async countByQuestionIds(questionIds: string[]) {
    const result: Record<string, number> = {};
    if (!questionIds.length) return result;

    const docs = await this.answerModel.aggregate([
      { $match: { questionId: { $in: questionIds } } },
      { $group: { _id: '$questionId', count: { $sum: 1 } } },
    ]);

    for (const item of docs) {
      result[String(item._id)] = item.count;
    }
    return result;
  }

  async findAll(questionId: string, opt: { page: number; pageSize: number }) {
    if (!questionId) return [];
    return await this.answerModel
      .find({ questionId })
      .skip((opt.page - 1) * opt.pageSize)
      .limit(opt.pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findAllByQuestionId(questionId: string) {
    if (!questionId) return [];
    return await this.answerModel
      .find({ questionId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  transformAnswerToRow(answer: AnswerDocument): AnswerRow {
    const row: AnswerRow = { _id: String(answer._id) };
    const answerList = answer.answerList ?? [];
    answerList.forEach((item: AnswerListItem) => {
      const value = item.value ?? [];
      row[item.componentId] = value.join(', ');
    });
    return row;
  }

  async getComponentStat(questionId: string, componentId: string) {
    const answers = await this.findAllByQuestionId(questionId);
    const statMap = new Map<string, number>();

    answers.forEach((answer) => {
      const target = (answer.answerList ?? []).find(
        (item: AnswerListItem) => item.componentId === componentId,
      );
      if (!target) return;
      const values = Array.isArray(target.value)
        ? target.value
        : [target.value];
      values.forEach((value) => {
        const name = String(value);
        statMap.set(name, (statMap.get(name) ?? 0) + 1);
      });
    });

    return Array.from(statMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }
}
