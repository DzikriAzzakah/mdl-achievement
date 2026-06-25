<template>
  <TemplateManageLayout
    title="Edit Audio"
    class="layout-edit-audio"
    :breadcrumbs="[]"
    :active-stepper="activeStep"
    :stepper="tab"
    is-tabs
    show-header-button
    :show-cancel="false"
    disable-footer
    :disable-submit="isDisabledSubmitBtn"
    :label-submit="buttonLabelSubmit"
    :fixed-bottom-footer="true"
    :show-submit="activeStep !== 'accessibility'"
    :is-use-breadcrumbs="false"
    @on-submit="handleSubmit"
    @on-change="activeStep = $event"
  >
    <template #content>
      <WebUiLoading
        v-if="isLoadingEdit || isLoadingGetCompetencies"
        class="h-[calc(100vh-200px)]"
      />
      <template v-else>
        <AudioInformation v-if="activeStep === 'audio-information'" />
        <Configuration v-if="activeStep === 'configuration'" />
        <Accessibility v-if="activeStep === 'accessibility'" />
      </template>
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import type { IAudioDetail, ICompetencyStructure } from '#audio/config/types.ts';
import { getAudioDetail, getSelectedCompetency, patchCompetencyId, patchEditAudio } from '#audio/api/api.ts';
import { patchTag } from '#audio/api/tag.ts';
import Accessibility from '#audio/components/form/Accessibility.vue';
import AudioInformation from '#audio/components/form/AudioInformation.vue';
import Configuration from '#audio/components/form/Configuration.vue';
import { getCompetencyOnly, isAllKeyBehaviourSelected, isAnyCompetencySelected, mapHierarchy } from '#audio/composables/useCompetencyTree.ts';
import { AUDIO_TABS } from '#audio/config/constant.ts';
import { PERMISSION_EDIT, PERMISSION_LIST } from '#audio/config/featureFlag.ts';
import { buildMediaUrl } from '#audio/helpers/index.ts';
import { postUploadFile } from '#core/api/upload.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import { useMutation, useQuery } from '@tanstack/vue-query';

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_EDIT],
  },
});

type TStep = 'audio-information' | 'configuration' | 'accessibility';

// utils
const route = useRoute();
const store = useAudioStore();
const { errors, getForm, detailAudio } = storeToRefs(store);
const { preventLeave } = useConfirmLeave();
const { $toast } = useNuxtApp();
const { getApiErrorMessage } = useUtility();
const { showLoading, hideLoading } = useGlobalLoading();

// data
const activeStep = ref<TStep>('audio-information');
const tab = AUDIO_TABS;
const audioId = route.params.id as string;
const isLoading = ref<boolean>(false);
const initialForm = ref<Record<string, any>>({});
const initialContent = ref<string | null>(null);
const initialCompetencies = ref<ICompetencyStructure[]>([]);
const initialThumbnailUrl = ref<string>('');
const isDisabledSubmitBtn = computed(() => {
  const isAllRequiredFilled
    = !!store.title
      && !!store.title.trim()
      && !!store.description
      && !!store.description.trim()
      && !!store.audioContent
      && (!!store.thumbnail || !!store.thumbnail_url)
      && isAnyCompetencySelected(store.competencies)
      && isAllKeyBehaviourSelected(store.competencies);

  const isChanged = hasActiveStatusChanged(initialCompetencies.value, store.competencies);

  if (isAllRequiredFilled && (isFormChanged() || isChanged || !!store.isNewCompetencyAdded)) {
    return false;
  }

  if (Object.keys(errors.value).length > 0) {
    return true;
  }

  return true;
});

function isFormChanged() {
  const current = getForm.value as Record<string, any>;
  const initial = initialForm.value as Record<string, any>;

  if (store.thumbnail instanceof File) {
    return true;
  }

  const currentThumbnailUrl = store.thumbnail_url || '';
  if ((initialThumbnailUrl.value || '') !== currentThumbnailUrl) {
    return true;
  }

  if (!initial || !current) {
    return false;
  }

  for (const key in initial) {
    if (typeof initial[key] === 'object' && initial[key] !== null) {
      if (JSON.stringify(initial[key]) !== JSON.stringify(current[key])) {
        return true;
      }
    }
    else {
      if (initial[key] !== current[key]) {
        if (key === 'level') {
          const initialLevel = initial[key];
          const currentLevel = typeof current[key] === 'object' && current[key] !== null
            ? current[key].value
            : current[key];
          if (initialLevel !== currentLevel) {
            return true;
          }
        }
        else if (initial[key] !== current[key]) {
          return true;
        }
      }
    }
  }
  return false;
}

const buttonLabelSubmit = computed(() => {
  if (activeStep.value === 'audio-information') {
    return 'Save Information';
  }
  return 'Save Configuration';
});

// patch tag
const { mutate: submitPatchTag } = useMutation({
  mutationFn: async () => {
    isLoading.value = true;
    showLoading('Submitting tags', 'Please wait while we update the tags.');
    await patchTag(audioId, { tags: store.tags });
  },
  onSettled: () => {
    isLoading.value = false;
    hideLoading();
  },
  onError: (err) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || 'Failed to update audio.',
    });
  },
});

// patch competency id
const { mutate: submitPatchCompetencyId } = useMutation({
  mutationFn: async () => {
    isLoading.value = true;
    const competencies = getCompetencyOnly(store.competencies).map((item: any) => {
      return {
        level_id: item?.competencyLevel?.id || null,
        id: item?.id,
      };
    });
    showLoading('Submitting competencies', 'Please wait while we update the competencies.');
    await patchCompetencyId(audioId, { competencies });
  },
  onSettled: () => {
    isLoading.value = false;
    hideLoading();
  },
  onError: (err) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || 'Failed to update audio.',
    });
  },
});

// fetch detail audio
const { isLoading: isLoadingEdit, refetch, isFetchedAfterMount } = useQuery({
  queryKey: ['get-detail-audio', audioId],
  queryFn: async () => {
    try {
      const getDetail = await getAudioDetail(Number(audioId));

      const responseDetail = getDetail?.data as IAudioDetail;
      initialContent.value = responseDetail.file_url
        || (responseDetail.audio_url || null);

      const normalizedThumbnailUrl = buildMediaUrl(responseDetail.cover_url)
        || (responseDetail.thumbnail_url || '');
      store.thumbnail_url = normalizedThumbnailUrl;
      initialThumbnailUrl.value = normalizedThumbnailUrl;
      detailAudio.value = responseDetail;

      // Map is_published -> status_enum, is_master -> is_master
      const formValues: Record<string, any> = {
        title: responseDetail.title || '',
        description: responseDetail.description || '',
        tags: Array.isArray(responseDetail.tags) ? responseDetail.tags.map((t: any) => typeof t === 'string' ? t : t?.tag).filter(Boolean) : [],
        audioContent: initialContent.value,
        status_enum: responseDetail.is_published ? 'publish' : (responseDetail.status_enum || 'draft'),
        is_master: responseDetail.is_master ?? responseDetail.is_master ?? false,
        level: responseDetail.level,
        metadata: responseDetail.metadata ? (typeof responseDetail.metadata === 'string' ? JSON.parse(responseDetail.metadata) : responseDetail.metadata) : {},
      };
      store.setFormValues(formValues, true);
      store.audio_url = responseDetail.file_url
        || (responseDetail.audio_url || '');
      initialForm.value = JSON.parse(JSON.stringify(formValues));
      return responseDetail || {};
    }
    catch (err: any) {
      $toast({
        variant: 'error',
        title: 'Error',
        text: getApiErrorMessage(err) || 'Failed to fetch detail audio.',
      });
      return { data: {} };
    }
  },
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

const { mutate: editAudioForm } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    await patchEditAudio(Number(audioId), payload);

    submitPatchTag();
    submitPatchCompetencyId();
    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Audio successfully updated.',
    });
    initialForm.value = JSON.parse(JSON.stringify(getForm.value));
    initialThumbnailUrl.value = store.thumbnail_url || '';
    store.thumbnail = null;
    preventLeave.value = false;
    store.isNewCompetencyAdded = false;
  },
  onError: (err) => {
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || 'Failed to update audio.',
    });
  },
});

// get selected competencies
const { isLoading: isLoadingGetCompetencies } = useQuery({
  queryKey: ['get-selected-competency-audio', audioId],
  queryFn: async () => {
    const response = await getSelectedCompetency(Number(audioId)).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to fetch selected tags.',
      });
      return { data: {} };
    });

    const { data } = response || {};
    const activeCompetencies = mapHierarchy(data as Record<string, any>[]);
    store.competencies = activeCompetencies || [];
    initialCompetencies.value = activeCompetencies || [];
    return [];
  },
  refetchOnMount: 'always',
});

const uploadAudio = async (file: File) => {
  const now = new Date();
  const now_mm = now.getMonth() + 1;
  const now_yyyy = now.getFullYear();
  const folder = `content/user-upload/file/${now_yyyy}/${now_mm}`;
  try {
    isLoading.value = true;
    showLoading('Uploading audio', 'Please wait while we upload the file.');
    const response = await postUploadFile(file, folder);
    const data = response?.data;
    store.audio_url = data?.image_host && data?.file_path ? `${data.image_host}/${data.file_path}` : (data?.file_path || null);
    hideLoading();
  }
  catch (err) {
    hideLoading();
    $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Thumbnail upload failed.' });
  }
  finally {
    isLoading.value = false;
  }
};

const uploadThumbnail = async (file: File) => {
  const now = new Date();
  const now_mm = now.getMonth() + 1;
  const now_yyyy = now.getFullYear();
  const folder = `content/user-upload/image/${now_yyyy}/${now_mm}`;
  try {
    isLoading.value = true;
    showLoading('Uploading thumbnail', 'Please wait while we upload the file.');
    const response = await postUploadFile(file, folder);
    const data = response?.data;
    hideLoading();
    store.thumbnail_url = data?.image_host && data?.file_path ? `${data.image_host}/${data.file_path}` : (data?.file_path || null);
  }
  catch (err) {
    hideLoading();
    $toast({ variant: 'error', title: 'Error', text: getApiErrorMessage(err as Error) || 'Thumbnail upload failed.' });
  }
  finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  // for checking between oldvalue and newvalue before submit to API
  if (store.audioContent !== initialContent.value) {
    await uploadAudio(store.audioContent as File);
  }

  if (store?.thumbnail instanceof File) {
    await uploadThumbnail(store.thumbnail);
  }

  const payload: Record<string, any> = {
    title: store?.title,
    description: store?.description,
    file_url: store.audio_url || undefined,
    cover_url: store?.thumbnail_url || undefined,
    is_published: store?.status_enum === 'publish',
    is_master: store?.is_master || false,
  };
  editAudioForm(payload);
};

provide('refetch-detail', refetch);

onBeforeUnmount(() => {
  store.$resetAll();
});

function hasActiveStatusChanged(oldNodes: any[], newNodes: any[]): boolean {
  if (!oldNodes || !newNodes) {
    return false;
  }

  // look for nodes in newNodes with the same id
  function findNodeById(nodes: any[], id: any): any | null {
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

  for (const oldNode of oldNodes) {
    const newNode = findNodeById(newNodes, oldNode.id);
    if (newNode) {
      if (oldNode.isActive !== newNode.isActive) {
        return true;
      }
      // Check children
      if (
        oldNode.children && newNode.children && hasActiveStatusChanged(oldNode.children, newNode.children)
      ) {
        return true;
      }
    }
  }
  return false;
}

watch(
  () => [getForm.value],
  () => {
    if (!isFetchedAfterMount.value) {
      return;
    };
    preventLeave.value = true;
  },
  { flush: 'post' },
);
</script>

<style lang="postcss">
.empty-layout:has(.layout-edit-audio) {
  margin: auto;
  max-width: 1280px;
}
</style>

<style scoped lang="postcss">
:deep(.base-layout__header-form-button) {
  width: 100%;
}

.template-manage__header {
  padding-top: 24px;
}
</style>
