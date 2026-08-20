import type { ConditionOperator } from '../schemas/question.schema';

class ConditionRuleDto {
  readonly id: string;
  readonly sourceId: string;
  readonly sourceField: string;
  readonly operator: ConditionOperator;
  readonly targetValue?: string | number | boolean | string[];
}

class ConditionGroupDto {
  readonly id: string;
  readonly logic: 'AND' | 'OR';
  readonly rules: ConditionRuleDto[];
}

class ComponentInfoDto {
  readonly fe_id: string;
  readonly type: string;
  readonly title: string;
  readonly isHidden?: boolean;
  readonly isLocked?: boolean;
  readonly props: Record<string, unknown>;
  readonly visibleCondition?: ConditionGroupDto | null;
}

export class QuestionDto {
  readonly title?: string;
  readonly desc?: string;
  readonly js?: string;
  readonly css?: string;
  readonly isPublished?: boolean;
  readonly isPublish?: boolean;
  readonly isDeleted?: boolean;
  readonly isStared?: boolean;
  readonly componentList?: ComponentInfoDto[];
}
