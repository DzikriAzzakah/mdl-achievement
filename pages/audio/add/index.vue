<template>
  <TemplateManageLayout
    title="Add Audio"
    class="layout-add-audio"
    :active-stepper="activeStepper"
    :breadcrumbs="[]"
    :stepper="stepper"
    :disable-submit="isDisabledSubmitBtn"
    :disable-cancel="activeStepper === 1"
    :label-cancel="buttonLabelCancel"
    :label-submit="buttonLabelSubmit"
    :is-loading-submit="isLoading"
    :is-loading-cancel="isLoading"
    :fixed-bottom-footer="true"
    :is-use-breadcrumbs="false"
    show-header-button
    disable-footer
    @on-cancel="handleCancel"
    @on-submit="handleSubmit"
  >
    <template #content>
      <AudioInformation v-if="activeStepper === 1" />
      <Configuration v-if="activeStepper === 2" />
      <Accessibility v-if="activeStepper === 3" />
    </template>
  </TemplateManageLayout>
</template>

<script setup lang="ts">
import { patchCompetencyId, patchEditAudio, postAddAudio } from '#audio/api/api';
import { patchTag } from '#audio/api/tag.ts';
import Accessibility from '#audio/components/form/Accessibility.vue';
import AudioInformation from '#audio/components/form/AudioInformation.vue';
import Configuration from '#audio/components/form/Configuration.vue';
import { getCompetencyOnly, isAllKeyBehaviourSelected } from '#audio/composables/useCompetencyTree';
import { CREATE_STEPPER } from '#audio/config/constant';
import { PERMISSION_CREATE, PERMISSION_LIST } from '#audio/config/featureFlag';
import { postUploadFile } from '#core/api/upload.ts';
import TemplateManageLayout from '#core/components/templates/ManageLayout.vue';
import { useMutation } from '@tanstack/vue-query';

const { $toast } = useNuxtApp();

definePageMeta({
  layout: 'empty',
  middleware: ['app-auth', 'rbac'],
  auth: { authenticatedOnly: true, navigateUnauthenticatedTo: '/' },
  rbac: {
    feature: PERMISSION_LIST,
    permissions: [PERMISSION_CREATE],
  },
});

// Utilities
const store = useAudioStore();
const { errors } = storeToRefs(store);
const router = useRouter();
const { showLoading, hideLoading } = useGlobalLoading();
const { preventLeave } = useConfirmLeave();
const { getApiErrorMessage } = useUtility();

// Reactive properties
const activeStepper = ref(1);
const stepper = CREATE_STEPPER;
const isLoading = ref<boolean>(false);
const initialContent = ref<string | null>(null);
const audioId = ref<number | string | null>(null);
// Check if form is dirty
function isFormDirty() {
  if (
    store.title
    || store.title?.trim()
    || store.description
    || store.description?.trim()
    || store.audioContent
    || store.thumbnail
  ) {
    return true;
  }
  return false;
}

watch(isFormDirty, (value) => {
  preventLeave.value = value;
});

const isDisabledSubmitBtn = computed(() => {
  if (activeStepper.value === 1) {
    return !(
      store.title
      && store.title?.trim()
      && store.description
      && store.description.trim()
      && store.audioContent
      && store.thumbnail
      && isAnyCompetencySelected(store.competencies)
      && isAllKeyBehaviourSelected(store.competencies)
      && !!store.isNewCompetencyAdded
    ) || Object.keys(errors.value).length > 0;
  }
  return false; // always enabled on step 2 & 3
});

const buttonLabelCancel = computed(() => {
  return 'Previous';
});

const buttonLabelSubmit = computed(() => {
  if (activeStepper.value === stepper.length) {
    return 'Done';
  }

  if (activeStepper.value === stepper.length - 1) {
    return 'Add Audio';
  }

  return 'Next';
});

function handleCancel() {
  if (activeStepper.value === 1) {
    router.back();
  }
  else {
    activeStepper.value -= 1;
  }
}

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
    store.thumbnail_url = data?.image_host && data?.file_path ? `${data.image_host}/${data.file_path}` : (data?.file_path || null);
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

const uploadAudio = async (file: File) => {
  const now = new Date();
  const now_mm = now.getMonth() + 1;
  const now_yyyy = now.getFullYear();
  const folder = `content/user-upload/audio/${now_yyyy}/${now_mm}`;
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

// patch tag
const { mutate: submitPatchTag } = useMutation({
  mutationFn: async () => {
    if (!store?.tags || store.tags.length < 1) {
      return;
    }
    isLoading.value = true;
    showLoading('Submitting tags', 'Please wait while we update the tags.');
    await patchTag(Number(store?.audioResponse?.id), { tags: store.tags });
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
    await patchCompetencyId(Number(store?.audioResponse?.id), { competencies });
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

// submit form audio
const { mutate: submitAudioForm } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    isLoading.value = true;
    const response = await postAddAudio(payload).catch(() => {
      $toast({
        variant: 'error',
        title: 'Error',
        text: 'Failed to add audio.',
      });
    });

    if (response) {
      const { data } = response;
      store.audioResponse = data;
      audioId.value = data?.id || null;

      const formValues: Record<string, any> = {
        thumbnail_url: data.cover_url || data.thumbnail_url || '',
        level: data.level,
        metadata: data.metadata ? JSON.parse(data.metadata) : {},
      };
      store.setFormValues(formValues, true);

      preventLeave.value = false;
      activeStepper.value += 1;
      initialContent.value = payload.file_url;

      submitPatchTag();
      submitPatchCompetencyId();
    }
  },
  onSettled: () => {
    isLoading.value = false;
    hideLoading();
  },
});

// submit form edit audio
const { mutate: editAudioForm } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    isLoading.value = true;
    await patchEditAudio(Number(store?.audioResponse?.id), payload);

    preventLeave.value = false;
    if (audioId.value) {
      submitPatchCompetencyId();
      activeStepper.value += 1;
    }
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

const setupPayload = (extra: Record<string, any> = {}) => {
  const meta_data = {
    thumbnail: store.meta_data_thumbnail,
    audio: store.meta_data_audio,
  };

  const basePayload: Record<string, any> = {
    title: store?.title,
    description: store?.description,
    file_url: store?.audio_url || undefined,
    cover_url: store?.thumbnail_url || undefined,
    metadata: JSON.stringify(meta_data),
    ...extra,
  };

  if (activeStepper.value === 1 && store?.audioContent !== initialContent.value) {
    basePayload.file_url = store?.audio_url || undefined;
  }
  return basePayload;
};

const handleSubmit = async () => {
  if (activeStepper.value === 1) {
    // Upload Thumbnail & audio
    if (store?.thumbnail instanceof File) {
      await uploadThumbnail(store.thumbnail);
    }
    if (store?.audioContent instanceof File) {
      await uploadAudio(store.audioContent);
    }

    // for back from step 2
    if (audioId.value) {
      editAudioForm(setupPayload());
    }
    else {
      submitAudioForm(setupPayload());
    }
  }
  else if (activeStepper.value === 2) {
    editAudioForm(setupPayload({
      is_published: store?.status_enum === 'publish',
      is_master: store?.is_master || false,
    }));
  }
  else {
    $toast({
      variant: 'success',
      title: 'Success',
      text: 'Audio successfully added.',
    });
    router.push({ name: 'audio' });
  }
};

onBeforeMount(() => {
  store.$resetAll();
});

onBeforeUnmount(() => {
  store.$resetAll();
});
</script>

<style lang="postcss">
.empty-layout:has(.layout-add-audio) {
  margin: auto;
  max-width: 1280px;
}

.template-manage__header {
  padding-top: 24px;
}
</style>
