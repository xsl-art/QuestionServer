import type { ComponentInfo, ConditionGroup } from '../schemas/question.schema';

export type CircularCheckResult = {
  hasCycle: boolean;
  cycle?: string[]; //组件Id列表环
};

/**
 * 从组件列表构建邻接表（只构建一次，缓存使用）
 * 被控制组件 -> 触发源组件[]
 */
export const buildAdjacency = (
  componentList: ComponentInfo[],
): Record<string, string[]> => {
  //邻接表对象
  const adjacency: Record<string, string[]> = {};
  const componentIds = new Set(componentList.map((item) => item.fe_id));

  componentList.forEach((comp) => {
    adjacency[comp.fe_id] = [];
    const condition = comp.visibleCondition;
    if (condition?.rules.length) {
      condition.rules.forEach((rule) => {
        if (rule.sourceId && componentIds.has(rule.sourceId)) {
          adjacency[comp.fe_id].push(rule.sourceId);
        }
      });
    }
  });
  return adjacency;
};

/**
 * 全量检测初始化
 */
export const checkCircularCondition = (
  componentList: ComponentInfo[],
): CircularCheckResult => {
  const adjacency = buildAdjacency(componentList);
  return checkCircularWithAdjacency(adjacency);
};

/**
 * 基于邻接表的环检测
 * @param adjacency 邻接表
 * @param startNodes 起始节点，用于增量检测
 */

export const checkCircularWithAdjacency = (
  adjacency: Record<string, string[]>,
  startNodes?: string[],
): CircularCheckResult => {
  const colors: Record<string, 'white' | 'gray' | 'black'> = {};
  const nodes = Object.keys(adjacency);

  nodes.forEach((node) => {
    colors[node] = 'white';
  });

  //访问路径
  const path: string[] = [];

  const dfs = (node: string): string[] | null => {
    //标记为访问
    colors[node] = 'gray';
    path.push(node);

    for (const neighbor of adjacency[node] || []) {
      if (colors[neighbor] === 'gray') {
        //出现环
        const cycleStart = path.indexOf(neighbor);
        //返回完整的循环路径
        return [...path.slice(cycleStart), neighbor];
      }

      if (colors[neighbor] === 'white') {
        const cycle = dfs(neighbor);
        if (cycle) return cycle;
      }
    }

    path.pop();
    colors[node] = 'black';
    return null;
  };

  const targets = startNodes || nodes;

  for (const node of targets) {
    if (colors[node] === 'white') {
      const cycle = dfs(node);
      if (cycle) return { hasCycle: true, cycle };
    }
  }
  return { hasCycle: false };
};

/**
 * 增量检测
 * 检测单个条件是否会形成循环引用
 * 复用已有邻接表，只修改目标节点的边
 * 只从目标节点dfs
 * 如果目标节点没有出边，无环
 */

export const checkCircularConditionForGroup = (
  componentList: ComponentInfo[],
  targetFeId: string,
  condition: ConditionGroup | null,
  cacheAdjacency?: Record<string, string[]>,
): CircularCheckResult => {
  const adjacency = cacheAdjacency || buildAdjacency(componentList);

  const newTargets: string[] = [];
  if (condition?.rules?.length) {
    const componentIds = new Set(componentList.map((item) => item.fe_id));
    condition.rules.forEach((rule) => {
      // 保留自环边：组件依赖自己同样属于循环引用
      if (rule.sourceId && componentIds.has(rule.sourceId)) {
        newTargets.push(rule.sourceId);
      }
    });
  }

  // 更新邻接表中目标组件的出边
  const updateAdjacency = { ...adjacency };
  updateAdjacency[targetFeId] = newTargets;

  // 空条件直接放行，并从邻接表中清除该节点的出边
  if (newTargets.length === 0) {
    return { hasCycle: false };
  }

  return checkCircularWithAdjacency(updateAdjacency, [targetFeId]);
};
