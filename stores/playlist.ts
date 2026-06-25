import type { IPlaylistDetail, IPlaylistForm } from '#audio/config/types.ts';
import { playlistValidationSchema } from '#audio/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm, useIsFormValid } from 'vee-validate';

export const useAudioPlaylistStore = defineStore('audioPlaylist', () => {
  // State
  const detailPlaylist = ref<IPlaylistDetail>();
  const playlistContent = ref<any[]>([]);
  const tagContent = ref<any[]>([]);
  const tags = ref<any[]>([]);

  // Form setup
  const {
    errors: playlistErrors,
    defineField: definePlaylistField,
    handleSubmit: handlePlaylistSubmit,
    resetForm: resetPlaylistForm,
    values: playlistValues,
    setValues: setPlaylistFormValues,
  } = useForm({
    validationSchema: playlistValidationSchema,
    initialValues: {
      playlistTitle: '',
      tags: [],
    } as IPlaylistForm,
  });

  // Computed
  const getPlaylistForm = computed(() => ({
    ...playlistValues,
    tags: tags.value,
  }));

  const isPlaylistValid = useIsFormValid();

  // Form fields
  const [playlistTitle] = definePlaylistField('playlistTitle');

  // Methods
  const setPlaylistContent = (contents: any) => {
    playlistContent.value = contents;
  };

  const removePlaylistContent = (contentId: any) => {
    playlistContent.value = playlistContent.value.filter((content: any) => content.id !== contentId);
  };

  const setTagContent = (contents: any) => {
    tagContent.value = contents;
  };

  const removeTagContent = (contentId: any) => {
    tagContent.value = tagContent.value.filter((content: any) => content.id !== contentId);
  };

  const $resetAll = () => {
    resetPlaylistForm();
    detailPlaylist.value = undefined;
    playlistContent.value = [];
    tagContent.value = [];
    tags.value = [];
  };

  return {
    // State
    detailPlaylist,
    playlistContent,
    tagContent,
    tags,

    // Form
    playlistErrors,
    playlistTitle,
    getPlaylistForm,
    isPlaylistValid,
    handlePlaylistSubmit,
    resetPlaylistForm,
    setPlaylistFormValues,

    // Methods
    setPlaylistContent,
    removePlaylistContent,
    setTagContent,
    removeTagContent,
    $resetAll,
  };
});
