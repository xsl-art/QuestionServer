import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AnswerDocument = HydratedDocument<Answer>;

export interface AnswerListItem {
  componentId: string; // fe_id
  value: string[];
}

@Schema({ timestamps: true })
export class Answer {
  @Prop({ required: true })
  questionId: string;

  @Prop({ type: [Object] })
  answerList: AnswerListItem[];

  _id: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
