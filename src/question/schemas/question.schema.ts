import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

export type ConditionOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'contains'
  | 'in'
  | 'not_in'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty';

export interface ConditionRule {
  id: string;
  sourceId: string;
  sourceField: string;
  operator: ConditionOperator;
  targetValue?: string | number | boolean | string[];
}

export interface ConditionGroup {
  id: string;
  logic: 'AND' | 'OR';
  rules: ConditionRule[];
}

export interface ComponentInfo {
  fe_id: string;
  type: string;
  title: string;
  isHidden?: boolean;
  isLocked?: boolean;
  props: Record<string, unknown>;
  visibleCondition?: ConditionGroup | null;
}

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true })
  title: string;

  @Prop()
  desc: string;

  @Prop()
  js: string;

  @Prop()
  css: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: false })
  isStar: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: true })
  author: string;

  @Prop({ type: [Object] })
  componentList: ComponentInfo[];

  @Prop({ type: Object })
  adjacencyCache?: Record<string, string[]>;

  _id: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
