<template>
  <div class="flex flex-col gap-4 overflow-auto">
    <!-- Search and Tree -->
    <div class="flex justify-between items-center gap-3">
      <WebUiInput
        v-model="search"
        placeholder="Search competency"
        icon="mdi-search"
        class="flex-1"
      >
        <template
          v-if="search"
          #trailing
        >
          <Icon
            name="mdi-close"
            width="20"
            height="20"
            mode="svg"
            class="text-gray-500 cursor-pointer"
            @click="search = ''"
          />
        </template>
      </WebUiInput>
    </div>

    <WebUiTreeview
      v-if="CompetencyStructuresOptions.length"
      ref="treeRef"
      v-model="CompetencyStructuresOptions"
      tree-line
      :default-open="false"
      :disable-drag="true"
      class="hierarchy-tree max-h-[604px] overflow-y-auto"
    >
      <!-- Number 604px is from design reference -->
      <template #default="{ node, stat }">
        <Icon
          v-if="stat.children?.length"
          :name="stat.open ? 'mdi:chevron-down' : 'mdi:chevron-right'"
          class="text-gray-700 cursor-pointer"
          size="20"
          @click="stat.open = !stat.open"
        />
        <div class="ml-1 text-lg w-full flex items-center gap-2 py-3 px-1.5 min-h-[60px]">
          <WebUiCheckbox
            :id="`select-all-${node?.id}`"
            :value="isDataSelected(node.id)"
            :checked="isDataSelected(node.id)"
            @change="({ checked }: any) => handleClickCompetency(node, checked)"
          />
          <span class="flex-1 font-medium text-sm">{{ node?.text }}</span>
        </div>
      </template>
    </WebUiTreeview>
    <WebUiEmptyState
      v-else
      title="We couldn’t find anything"
      description="Perhaps consider using a different keyword for better results."
    />
  </div>
</template>

<script setup lang="ts">
import type { ICompetencyStructure } from '#audio/config/types.ts';
import { getCompetencyTree } from '#audio/api/api.ts';
import { mapHierarchy } from '#audio/composables/useCompetencyTree.ts';
import { useAudioStore } from '#audio/stores/audio.ts';
import { useQuery } from '@tanstack/vue-query';

// utilities
const { debounce, getApiErrorMessage } = useUtility();
const { $toast } = useNuxtApp();
const treeRef = ref();
const store: { competencies: any[]; } = useAudioStore();

// state
const search = ref<string>('');
const debouncedSearch = ref<string>('');
const CompetencyStructuresOptions = ref<ICompetencyStructure[]>([]);
const isSyncingParents = ref(false);

// methods
const handleSearch = debounce((key: string) => {
  if (key.length > 2 || key.length === 0) {
    debouncedSearch.value = key;
  }
}, 1000);

const { data, error, isError } = useQuery({
  queryKey: ['get-competency-tree', debouncedSearch],
  queryFn: async () => {
    const response = await getCompetencyTree({
      keyword: debouncedSearch.value || undefined,
    });
    const { data } = response || {};
    return mapHierarchy(data);
  },
  refetchOnMount: true,
  placeholderData: prev => prev ?? [],
});

watch(
  data,
  (mappedStructure) => {
    let items;
    try {
      items = structuredClone(mappedStructure ?? []);
    }
    catch {
      items = JSON.parse(JSON.stringify(mappedStructure ?? []));
    }

    CompetencyStructuresOptions.value = items;

    if (debouncedSearch.value) {
      nextTick(() => {
        handleOpenTree();
      });
    }

    if (!store.competencies || store.competencies.length === 0) {
      store.competencies = items.map((node: any) => node);
    }
    else {
      syncParentInactive(store.competencies);
      syncParentInactive(CompetencyStructuresOptions.value);
    }
  },
  { immediate: true },
);

function handleOpenTree() {
  treeRef?.value?.treeRef?.openAll();
}

function isActiveInStore(dataId: any, nodes: any[]): boolean {
  for (const node of nodes) {
    if (node.id === dataId) {
      return node.isActive === true;
    }
    if (node.children && node.children.length) {
      if (isActiveInStore(dataId, node.children)) {
        return true;
      }
    }
  }
  return false;
}

function setActiveInOptionsIfActiveInStore(dataId: any, nodes: any[]): boolean {
  for (const node of nodes) {
    if (node.id === dataId) {
      if (isActiveInStore(dataId, store.competencies)) {
        node.isActive = true;
        return true;
      }
      return false;
    }
    if (node.children && node.children.length) {
      if (setActiveInOptionsIfActiveInStore(dataId, node.children)) {
        return true;
      }
    }
  }
  return false;
}

function isDataSelected(dataId: any) {
  const active = isActiveInStore(dataId, store.competencies);
  if (active) {
    setActiveInOptionsIfActiveInStore(dataId, CompetencyStructuresOptions.value);
    return true;
  }
  return false;
}

function checkParentIfNeeded(node: any) {
  let currentNode = node;
  while (currentNode && currentNode.parentId !== undefined) {
    const parentNode = findNodeById(CompetencyStructuresOptions.value, currentNode.parentId);
    if (parentNode && parentNode.children) {
      const allChildrenActive = parentNode.children.every((child: any) => child.isActive === true);
      if (allChildrenActive && !parentNode.isActive) {
        parentNode.isActive = true;
        // if any store.competencies, do update too
        const storeParent = findNodeById(store.competencies, parentNode.id);
        if (storeParent) {
          storeParent.isActive = true;
        }
      }
      currentNode = parentNode;
    }
    else {
      break;
    }
  }
}

function uncheckParentIfNeeded(node: any) {
  let currentNode = node;
  while (currentNode && currentNode.parentId !== undefined) {
    const parentNode = findNodeById(CompetencyStructuresOptions.value, currentNode.parentId);
    if (!parentNode) {
      break;
    }

    const allChildrenActive = parentNode.children && parentNode.children.length
      ? parentNode.children.every((child: any) => {
          // ensure we read the latest state from options tree
          const optChild = findNodeById(CompetencyStructuresOptions.value, child.id) || child;
          return optChild.isActive === true;
        })
      : false;

    // set parent state consistently in both trees
    setIsActiveById(CompetencyStructuresOptions.value, parentNode.id, allChildrenActive);
    setIsActiveById(store.competencies, parentNode.id, allChildrenActive);

    currentNode = parentNode;
  }
}

function findNodeById(nodes: any[], id: number): any | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function setIsActiveById(nodes: any[], id: number, isActive: boolean) {
  for (const node of nodes) {
    if (node.id === id) {
      node.isActive = isActive;
      return true;
    }
    if (node.children && node.children.length) {
      if (setIsActiveById(node.children, id, isActive)) {
        return true;
      }
    }
  }
  return false;
}

function setChildrenActiveBothTrees(children: any[], isActive: boolean) {
  for (const child of children) {
    setIsActiveById(store.competencies, child.id, isActive);
    setIsActiveById(CompetencyStructuresOptions.value, child.id, isActive);
    if (child.children) {
      setChildrenActiveBothTrees(child.children, isActive);
    }
  }
}

function handleClickCompetency(node: any, checked: boolean) {
  setIsActiveById(store.competencies, node.id, checked);
  setIsActiveById(CompetencyStructuresOptions.value, node.id, checked);

  if (node.children) {
    setChildrenActiveBothTrees(node.children, checked);
  }

  checkParentIfNeeded(node);

  if (!checked) {
    uncheckParentIfNeeded(node);
  }
}

function syncParentSelection(nodes: any[]) {
  // collect parents to add first (avoid mutating store while traversing)
  const nodesToAdd: any[] = [];

  function collect(nodeList: any[]) {
    for (const node of nodeList) {
      if (node.children && node.children.length > 0) {
        collect(node.children);

        const allChildrenSelected = node.children.every((child: any) =>
          store.competencies.some((item: any) => item.id === child.id),
        );

        const alreadySelectedInStore = store.competencies.some((item: any) => item.id === node.id);
        const alreadyPlanned = nodesToAdd.some((item: any) => item.id === node.id);

        if (allChildrenSelected && !alreadySelectedInStore && !alreadyPlanned) {
          // push a shallow clone so we don't accidentally keep direct refs
          const clone = { ...node, children: node.children ? [...node.children] : undefined };
          nodesToAdd.push(clone);
        }
      }
    }
  }

  collect(nodes);

  if (nodesToAdd.length === 0) {
    return;
  }

  // batch apply changes while preventing watcher re-entry
  isSyncingParents.value = true;
  try {
    // ensure no duplicates before adding
    for (const n of nodesToAdd) {
      if (!store.competencies.some((item: any) => item.id === n.id)) {
        store.competencies.push(n);
        setIsActiveById(store.competencies, n.id, true);
        setIsActiveById(CompetencyStructuresOptions.value, n.id, true);
      }
    }
  }
  finally {
    // allow watcher to run again after mutation finished
    isSyncingParents.value = false;
  }
}

function syncParentInactive(nodes: any[]) {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      syncParentInactive(node.children);

      // for change its isActive status parent when if atleast 1 children inactive
      const anyChildInactive = node.children.some((child: any) => child.isActive === false);
      if (anyChildInactive && node.isActive !== false) {
        node.isActive = false;
      }
    }
  }
}

// watch search
watch(search, (newVal: any) => handleSearch(newVal));

// watch error api's hit
watch(isError, (value) => {
  if (value) {
    $toast({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error?.value as Error) || 'An error occurred',
    });
  }
});

watch(
  () => store.competencies,
  () => {
    if (isSyncingParents.value) {
      return;
    }
    syncParentSelection(CompetencyStructuresOptions.value);
  },
  { immediate: true, deep: true },
);
</script>
