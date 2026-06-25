<template>
  <div class="flex flex-col gap-5 pb-8 self-stretch">
    <h3 class="text-base font-semibold text-gray-900">
      Preferences
    </h3>
    <WebUiSwitch
      v-model="publishStates"
      :wrapper-props="{
        class: 'w-max',
      }"
      label="Publish Audio"
      :description="publishDescription"
      @change="handleSwitchChange('status_enum', $event.target.checked)"
    />
    <WebUiSwitch
      v-model="is_master"
      :wrapper-props="{
        class: 'w-max',
      }"
      label="Master Data"
      :description="masterDataDescription"
      @change="handleSwitchChange('is_master', $event.target.checked)"
    />
  </div>
</template>

<script lang="ts" setup>
import { patchEditAudio, togglePublishAudio } from '#audio/api/api.ts';
import { useMutation } from '@tanstack/vue-query';

const { $toast, $popup } = useNuxtApp();
const store = useAudioStore();
const { getApiErrorMessage } = useUtility();
const {
  status_enum,
  is_master,
  detailAudio,
} = storeToRefs(store);
const initialVal = ref({
  status_enum: status_enum.value,
  is_master: is_master.value,
});
const lastSwitchKey = ref<'status_enum' | 'is_master' | null>(null);

const publishDescription = computed(() => {
  return 'Publish this audio directly on myDigiLearn platform';
});

const masterDataDescription = computed(() => {
  return 'Allow this audio to be used in learning content creation';
});

const publishStates = ref<boolean>(status_enum.value === 'publish');

const toastMessages = {
  publish: {
    success: 'Audio successfully published.',
    error: 'Failed to publish audio.',
  },
  unpublish: {
    success: 'Audio successfully unpublished.',
    error: 'Failed to unpublish audio.',
  },
  addMaster: {
    success: 'Audio successfully added to master data.',
    error: 'Failed to add audio to master data.',
  },
  removeMaster: {
    success: 'Audio successfully removed from master data.',
    error: 'Failed to remove audio from master data.',
  },
};

const toastState = ref<{ success: string; error: string; }>({
  success: '',
  error: '',
});

const { mutate: togglePublish } = useMutation({
  mutationFn: async () => {
    await togglePublishAudio(detailAudio.value?.id as number);
    $toast({
      variant: 'success',
      title: 'Success',
      text: toastState.value.success,
    });

    if (lastSwitchKey.value === 'status_enum') {
      const newStatus = publishStates.value ? 'publish' : 'draft';
      status_enum.value = newStatus;
      initialVal.value.status_enum = newStatus;
    }
  },
  onError: (err) => {
    if (lastSwitchKey.value === 'status_enum') {
      publishStates.value = initialVal.value.status_enum === 'publish';
      store.status_enum = initialVal.value.status_enum;
    }
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || toastState.value.error,
    });
  },
});

const { mutate: editAudioForm } = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    await patchEditAudio(detailAudio.value?.id, payload);
    $toast({
      variant: 'success',
      title: 'Success',
      text: toastState.value.success,
    });

    if (lastSwitchKey.value === 'is_master') {
      is_master.value = payload.is_master;
      initialVal.value.is_master = payload.is_master;
    }
  },
  onError: (err) => {
    if (lastSwitchKey.value === 'is_master') {
      store.is_master = initialVal.value.is_master;
    }
    $toast({
      variant: 'error',
      title: 'Error',
      text: getApiErrorMessage(err) || toastState.value.error,
    });
  },
});

async function handleSwitchChange(key: 'status_enum' | 'is_master', value: boolean) {
  lastSwitchKey.value = key;
  const audioTitle = detailAudio.value?.title || '';
  let popupConfig: any = {};

  if (key === 'status_enum') {
    if (value) {
      popupConfig = {
        variant: 'info',
        title: 'Publish Audio?',
        html: `Do you want to publish this audio?<br> <b><i>${audioTitle}</i></b>`,
        confirmButtonText: 'Publish',
      };
      toastState.value = toastMessages.publish;
    }
    else {
      popupConfig = {
        variant: 'warning',
        title: 'Unpublish Audio?',
        html: `Do you want to unpublish this audio?<br> <b><i>${audioTitle}</i></b>`,
        confirmButtonText: 'Unpublish',
      };
      toastState.value = toastMessages.unpublish;
    }
  }
  else if (key === 'is_master') {
    if (value) {
      popupConfig = {
        variant: 'info',
        title: 'Add Audio as Master Data?',
        html: `Do you want to set this audio as master data?<br> <b><i>${audioTitle}</i></b>`,
        confirmButtonText: 'Add',
      };
      toastState.value = toastMessages.addMaster;
    }
    else {
      popupConfig = {
        variant: 'warning',
        title: 'Remove from Master Data?',
        html: `Do you want to remove this audio from master data?<br> <b><i>${audioTitle}</i></b>`,
        confirmButtonText: 'Remove',
      };
      toastState.value = toastMessages.removeMaster;
    }
  }

  const result = await $popup({
    ...popupConfig,
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    focusCancel: true,
  });

  if (result.isConfirmed) {
    if (key === 'status_enum') {
      publishStates.value = value;
      status_enum.value = value ? 'publish' : 'draft';
      initialVal.value.status_enum = status_enum.value;
      togglePublish();
    }
    else if (key === 'is_master') {
      is_master.value = value;
      initialVal.value.is_master = value;
      editAudioForm({ is_master: is_master.value });
    }
  }
  else {
    if (key === 'status_enum') {
      publishStates.value = initialVal.value.status_enum === 'publish';
      status_enum.value = initialVal.value.status_enum;
    }
    else {
      is_master.value = initialVal.value.is_master;
    }
  }
}
watch(status_enum, (val) => {
  publishStates.value = val === 'publish';
});
</script>
