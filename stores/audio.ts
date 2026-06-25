import type { IAudioDetail, IAudioForm, IAudioResponse } from '#audio/config/types.ts';
import { audioValidationSchema } from '#audio/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm, useIsFormValid } from 'vee-validate';

export const useAudioStore = defineStore('audio', () => {
  // state for detail
  const detailAudio = ref<IAudioDetail>();
  const audioResponse = ref<IAudioResponse>();
  const thumbnail_url = ref<string | null>('');
  const audio_url = ref<string | null>('');

  const { errors, defineField, handleSubmit, resetForm, values, setValues: setFormValues } = useForm({
    validationSchema: audioValidationSchema,
    initialValues: {
      title: '',
      description: '',
      tags: [],
      audioContent: null,
      thumbnail: null,
      status_enum: 'draft',
      is_master: false,
      competencies: [],
      meta_data_audio: {},
      meta_data_thumbnail: {},
      metadata: {},
    } as unknown as IAudioForm,
  });

  // Helpers
  const isValid = useIsFormValid();
  const getForm = computed(() => ({ ...values }));

  // general section
  const [title] = defineField('title');
  const [description] = defineField('description');
  const [tags] = defineField('tags');
  const [audioContent] = defineField('audioContent');
  const [thumbnail] = defineField('thumbnail');
  const [meta_data_audio] = defineField('meta_data_audio');
  const [meta_data_thumbnail] = defineField('meta_data_thumbnail');
  const [metadata] = defineField('metadata');

  // competencies section
  const [competencies] = defineField('competencies');
  const isNewCompetencyAdded = ref<boolean>(false);

  // preferences section
  const [status_enum] = defineField('status_enum');
  const [is_master] = defineField('is_master');

  const setSelectedCompetency = (data: any[]) => {
    competencies.value = data;
  };

  const removeSelectedCompetency = (nodes: any[], id: number, isActive: boolean) => {
    for (const node of nodes) {
      if (node.id === id) {
        node.isActive = isActive;
        return true;
      }
      if (node.children && node.children.length) {
        if (removeSelectedCompetency(node.children, id, isActive)) {
          return true;
        }
      }
    }
    return false;
  };

  const $resetAll = () => {
    resetForm();
    detailAudio.value = undefined;
    audioResponse.value = undefined;
    audio_url.value = '';
    thumbnail_url.value = '';
    isNewCompetencyAdded.value = false;
  };

  return {
    audio_url,
    detailAudio,
    thumbnail_url,
    errors,
    title,
    description,
    tags,
    audioContent,
    thumbnail,
    meta_data_audio,
    meta_data_thumbnail,
    metadata,
    competencies,
    status_enum,
    is_master,
    $resetAll,
    resetForm,
    isValid,
    handleSubmit,
    getForm,
    setFormValues,
    setSelectedCompetency,
    removeSelectedCompetency,
    audioResponse,
    isNewCompetencyAdded,
  };
});
