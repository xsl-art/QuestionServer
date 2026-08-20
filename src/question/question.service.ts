import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import {
  checkCircularCondition,
  checkCircularConditionForGroup,
  buildAdjacency,
} from './utils/circularConditionCheck';
import type { ConditionGroup } from './schemas/question.schema';

export interface QuestionListItem {
  id: string;
  title: string;
  desc?: string;
  isPublished: boolean;
  isStared: boolean;
  answerCount: number;
  createAT: string;
}

export interface QuestionDetail {
  id: string;
  title: string;
  desc: string;
  js: string;
  css: string;
  isPublished: boolean;
  isDeleted: boolean;
  componentList: Question['componentList'];
}

interface FindAllListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  isDeleted?: boolean;
  isStar?: boolean | null;
  author?: string;
}

interface CountAllParams {
  keyword?: string;
  isStar?: boolean | null;
  author?: string;
  isDeleted?: boolean;
}

interface QuestionQuery {
  author?: string;
  isDeleted?: boolean;
  isStar?: boolean;
  title?: { $regex: RegExp };
}

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async create(username: string): Promise<QuestionListItem> {
    const question = new this.questionModel({
      title: '问卷标题' + Date.now(),
      desc: '问卷描述',
      author: username,
      componentList: [
        {
          fe_id: nanoid(),
          type: 'questionInfo',
          title: '问卷信息',
          props: { title: '问卷标题', desc: '问卷描述..' },
        },
      ],
    });
    const saved = await question.save();
    return this.mapToListItem(saved, 0);
  }

  async findPublicList(): Promise<
    Pick<QuestionListItem, 'id' | 'title' | 'desc'>[]
  > {
    const docs = await this.questionModel
      .find({ isPublished: true, isDeleted: false })
      .sort({ _id: -1 })
      .lean()
      .exec();

    return docs.map((doc) => ({
      id: String(doc._id),
      title: String(doc.title),
      desc: typeof doc.desc === 'string' ? doc.desc : '',
    }));
  }

  async findOne(id: string): Promise<QuestionDetail | null> {
    const question = await this.questionModel.findById(id).lean().exec();
    if (!question) return null;
    return this.mapToDetail(question);
  }

  async update(
    id: string,
    updateData: Partial<Question>,
    author: string,
  ): Promise<QuestionDetail | null> {
    if (updateData.componentList) {
      const result = checkCircularCondition(updateData.componentList);
      if (result.hasCycle) {
        throw new BadRequestException(
          `条件显示存在循环引用：${result.cycle?.join(' → ')}`,
        );
      }
      // 全量更新时重建邻接表缓存
      updateData.adjacencyCache = buildAdjacency(updateData.componentList);
    }

    const updated = await this.questionModel
      .findByIdAndUpdate({ _id: id, author }, updateData, { new: true })
      .lean()
      .exec();
    return updated ? this.mapToDetail(updated) : null;
  }

  async updateVisibleCondition(
    id: string,
    fe_id: string,
    visibleCondition: ConditionGroup | null,
    author: string,
  ): Promise<QuestionDetail | null> {
    const question = await this.questionModel.findById(id).lean().exec();
    if (!question) return null;
    if (question.author !== author) return null;

    const componentList = question.componentList || [];
    const cacheAdjacency = question.adjacencyCache;

    // 增量循环检测
    const result = checkCircularConditionForGroup(
      componentList,
      fe_id,
      visibleCondition,
      cacheAdjacency,
    );
    if (result.hasCycle) {
      throw new BadRequestException(
        `条件显示存在循环引用：${result.cycle?.join(' → ')}`,
      );
    }

    // 更新目标组件的 visibleCondition
    const newComponentList = componentList.map((comp) =>
      comp.fe_id === fe_id ? { ...comp, visibleCondition } : comp,
    );

    // 重建邻接表缓存
    const newAdjacencyCache = buildAdjacency(newComponentList);

    const updated = await this.questionModel
      .findByIdAndUpdate(
        id,
        { componentList: newComponentList, adjacencyCache: newAdjacencyCache },
        { new: true },
      )
      .lean()
      .exec();
    return updated ? this.mapToDetail(updated) : null;
  }

  async delete(id: string, author: string) {
    const res = await this.questionModel.findByIdAndUpdate(
      { _id: id, author },
      { isDeleted: true },
      { new: true },
    );
    return res;
  }

  async deleteMany(ids: string[], author: string) {
    return await this.questionModel.deleteMany({
      _id: { $in: ids },
      author,
    });
  }

  async findAllList({
    keyword = '',
    page = 1,
    pageSize = 6,
    isDeleted = false,
    isStar,
    author = '',
  }: FindAllListParams) {
    const opt: QuestionQuery = { author, isDeleted };
    if (isStar !== null && isStar !== undefined) opt.isStar = isStar;
    if (keyword) {
      const reg = new RegExp(keyword, 'i');
      opt.title = { $regex: reg }; //模糊搜索
    }

    return await this.questionModel
      .find(opt)
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();
  }

  async countAll({
    keyword,
    isStar,
    author = '',
    isDeleted = false,
  }: CountAllParams) {
    const opt: QuestionQuery = { author, isDeleted };
    if (isStar !== null && isStar !== undefined) opt.isStar = isStar;
    if (keyword) {
      const reg = new RegExp(keyword, 'i');
      opt.title = { $regex: reg }; //模糊搜索
    }
    return await this.questionModel.countDocuments(opt);
  }

  async duplicate(
    id: string,
    author: string,
  ): Promise<QuestionListItem | null> {
    const question = await this.questionModel.findById(id).lean().exec();
    if (!question) {
      return null;
    }
    const newQuestion = new this.questionModel({
      ...question,
      _id: new mongoose.Types.ObjectId(),
      title: question.title + '副本',
      author,
      isPublished: false,
      isStar: false,
      componentList: question.componentList?.map((item) => ({
        ...item,
        fe_id: nanoid(),
      })),
    });
    const saved = await newQuestion.save();
    return this.mapToListItem(saved, 0);
  }

  private mapToListItem(
    doc: QuestionDocument | Record<string, unknown>,
    answerCount: number,
  ): QuestionListItem {
    const record = doc as Record<string, unknown>;
    const createdAt = record.createdAt;
    return {
      id: String(record._id),
      title: String(record.title),
      isPublished: Boolean(record.isPublished),
      isStared: Boolean(record.isStar),
      answerCount,
      createAT:
        createdAt instanceof Date
          ? createdAt.toISOString()
          : String((createdAt as Date)?.toISOString?.() ?? createdAt ?? ''),
    };
  }

  private mapToDetail(
    doc: QuestionDocument | Record<string, unknown>,
  ): QuestionDetail {
    const record = doc as Record<string, unknown>;
    return {
      id: String(record._id),
      title: String(record.title),
      desc: typeof record.desc === 'string' ? record.desc : '',
      js: typeof record.js === 'string' ? record.js : '',
      css: typeof record.css === 'string' ? record.css : '',
      isPublished: Boolean(record.isPublished),
      isDeleted: Boolean(record.isDeleted),
      componentList: (record.componentList ?? []) as Question['componentList'],
    };
  }

  mapDocumentsToListItems(
    docs: QuestionDocument[] | Record<string, unknown>[],
    answerCounts: Record<string, number>,
  ): QuestionListItem[] {
    return docs.map((doc) =>
      this.mapToListItem(
        doc as Record<string, unknown>,
        answerCounts[String(doc._id)] ?? 0,
      ),
    );
  }
}
