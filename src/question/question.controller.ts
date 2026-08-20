import { Public } from '../auth/decorators/public.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionDto } from './dto/question.dto';
import { AnswerService } from '../answer/answer.service';
import { Question, type ConditionGroup } from './schemas/question.schema';
import type { AuthenticatedRequest } from '../types/express';

@Controller('question')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
  ) {}

  @Post()
  async create(@Request() req: AuthenticatedRequest) {
    const { username } = req.user.userInfo;
    return await this.questionService.create(username);
  }

  @Get()
  async findAll(
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('isDeleted') isDeleted: boolean = false,
    @Query('isStar') isStar: boolean = false,
    @Request() req: AuthenticatedRequest,
  ) {
    const author = req.user.userInfo.username;
    const [listDocs, total] = await Promise.all([
      this.questionService.findAllList({
        keyword,
        page,
        pageSize,
        isDeleted,
        isStar,
        author,
      }),
      this.questionService.countAll({
        keyword,
        isStar,
        author,
        isDeleted,
      }),
    ]);

    const ids = listDocs.map((doc) => String(doc._id));
    const answerCounts = await this.answerService.countByQuestionIds(ids);

    const list = this.questionService.mapDocumentsToListItems(
      listDocs,
      answerCounts,
    );
    return { list, total };
  }

  @Public()
  @Get('public/list')
  async findPublicList() {
    const list = await this.questionService.findPublicList();
    return { list };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const question = await this.questionService.findOne(id);
    if (!question) {
      throw new HttpException('问卷不存在', HttpStatus.NOT_FOUND);
    }
    return question;
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() questionDto: QuestionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const updateData: Partial<Question> = { ...questionDto };

    if (questionDto.isPublish !== undefined) {
      (updateData as Record<string, unknown>).isPublished =
        questionDto.isPublish;
      delete (updateData as Record<string, unknown>).isPublish;
    }

    // 兼容 low-code 前端收藏的别名字段
    if (questionDto.isStared !== undefined) {
      (updateData as Record<string, unknown>).isStar = questionDto.isStared;
      delete (updateData as Record<string, unknown>).isStared;
    }

    return await this.questionService.update(
      id,
      updateData,
      req.user.userInfo.username,
    );
  }

  @Patch(':id/visible-condition/:fe_id')
  async updateVisibleCondition(
    @Param('id') id: string,
    @Param('fe_id') fe_id: string,
    @Body() body: { visibleCondition: ConditionGroup | null },
    @Request() req: AuthenticatedRequest,
  ) {
    const result = await this.questionService.updateVisibleCondition(
      id,
      fe_id,
      body.visibleCondition,
      req.user.userInfo.username,
    );
    if (!result) {
      throw new HttpException('问卷不存在', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return await this.questionService.delete(id, req.user.userInfo.username);
  }

  @Delete()
  deleteMany(
    @Body() body: { ids: string[] },
    @Request() req: AuthenticatedRequest,
  ) {
    const { ids = [] } = body;
    return this.questionService.deleteMany(ids, req.user.userInfo.username);
  }

  @Post('duplicate/:id')
  async duplicate(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const result = await this.questionService.duplicate(
      id,
      req.user.userInfo.username,
    );
    if (!result) {
      throw new HttpException('问卷不存在', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
