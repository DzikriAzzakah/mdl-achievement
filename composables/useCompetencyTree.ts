import type { ICompetencyStructure } from '#audio/config/types.ts';

type NodeType = 'group' | 'category' | 'competency';

const nodeConfig = {
  group: {
    id: 'group_id',
    text: 'group_title',
    children: 'categories',
    nextType: 'category',
    isActive: 'is_active',
    competencyLevel: 'level',
  },
  category: {
    id: 'category_id',
    text: 'category_title',
    children: 'competencies',
    nextType: 'competency',
    isActive: 'is_active',
    competencyLevel: 'level',
  },
  competency: {
    id: 'competency_id',
    text: 'competency_joined_title',
    children: undefined,
    nextType: undefined,
    isActive: 'is_active',
    competencyLevel: 'level',
  },
};

export function mapHierarchy(
  data: Record<string, any>[],
  type: NodeType = 'group',
  level: number = 1,
  parentNames: string[] = [],
  parentId?: number,
): ICompetencyStructure[] {
  const config = nodeConfig[type];
  return data.map((item) => {
    const currentParentNames = [...parentNames, item[config.text]];
    const node: ICompetencyStructure & { parentId?: number; } = {
      id: item[config.id],
      text: item[config.text],
      level,
      competencyLevel: item[config?.competencyLevel],
      parentNames,
      parentId,
      isActive: item[config.isActive] ?? false,
    };
    if (config.children && item[config.children]?.length) {
      node.children = mapHierarchy(
        item[config.children],
        config.nextType as NodeType,
        level + 1,
        currentParentNames,
        item[config.id],
      );
    }
    return node;
  });
}

// Take only level 3 (competency only)
export function getCompetencyOnly(nodes: any[]): any[] {
  let result: any[] = [];
  nodes.forEach((node) => {
    if (node.level === 3 && node.isActive === true) {
      result.push(node);
    }
    if (node.children) {
      result = result.concat(getCompetencyOnly(node.children));
    }
  });
  // Filtering duplicate
  const unique: Record<number, any> = {};
  result.forEach((item) => {
    unique[item.id] = item;
  });
  return Object.values(unique);
}

export function isAnyCompetencySelected(nodes: any[]): boolean {
  for (const node of nodes) {
    if (node.isActive) {
      return true;
    }
    if (node.children && node.children.length > 0) {
      if (isAnyCompetencySelected(node.children)) {
        return true;
      }
    }
  }
  return false;
}

export function isAllKeyBehaviourSelected(nodes: any[]): boolean {
  const competencies = getCompetencyOnly(nodes);
  return competencies.every(
    (item: any) => Array.isArray(item?.competencyLevel?.behaviours) && item?.competencyLevel?.behaviours?.length > 0,
  );
}
