import type { IFeaturedContentOptions, ILandingSectionForm, IPlaylistOptions, ISectionTypeOptions, ISourceTypeOptions, ITagsOptions } from '#audio/config/types.ts';
import { landingSectionValidationSchema } from '#audio/utils/validationSchema.ts';
import { defineStore } from 'pinia';
import { useForm, useIsFormValid } from 'vee-validate';

export const useAudioLandingStore = defineStore('audioLanding', () => {
  // Form setup
  const {
    errors: landingSectionErrors,
    defineField: defineLandingSectionField,
    handleSubmit: handleLandingSectionSubmit,
    resetForm: resetLandingSectionForm,
    values: landingSectionValues,
    setValues: setLandingSectionFormValues,
  } = useForm({
    validationSchema: landingSectionValidationSchema,
    initialValues: {
      sectionTitle: '',
    } as ILandingSectionForm,
  });

  const isLandingSectionValid = useIsFormValid();

  // Form fields
  const [sectionTitle] = defineLandingSectionField('sectionTitle');

  // Additional state (not in validation schema)
  const sectionContent = ref<any[]>([]);
  const sectionDescription = ref<string>('');
  const sectionType = ref<ISectionTypeOptions | null>(null);
  const sectionPlaylist = ref<IPlaylistOptions | null>(null);
  const featuredContentType = ref<IFeaturedContentOptions | null>(null);
  const selectedFeaturedContent = ref<Record<any, string>[]>([]);
  const layoutType = ref<Record<string, any>>({ label: 'List', value: 'list' });
  const sourceType = ref<ISourceTypeOptions | null>(null);
  const sourcePlaylist = ref<IPlaylistOptions | null>(null);
  const sourceTag = ref<ITagsOptions | null>(null);

  const originalSectionItemIds = ref<Set<number>>(new Set());

  // Computed
  const getLandingSectionForm = computed(() => ({
    ...landingSectionValues,
    sectionDescription: sectionDescription.value,
    sectionType: sectionType.value,
    sectionPlaylist: sectionPlaylist.value,
    featuredContentType: featuredContentType.value,
    selectedFeaturedContent: selectedFeaturedContent.value,
    layoutType: layoutType.value,
    sourceType: sourceType.value,
    sourcePlaylist: sourcePlaylist.value,
    sourceTag: sourceTag.value,
  }));

  // Methods
  const setSectionContent = (contents: any) => {
    sectionContent.value = contents;
  };

  const removeSectionContent = (contentId: any) => {
    sectionContent.value = sectionContent.value.filter((content: any) => content.id !== contentId);
  };

  const setSelectedFeaturedContent = (contents: any) => {
    selectedFeaturedContent.value = contents;
  };

  const removeSelectedFeaturedContent = (contentId: any) => {
    selectedFeaturedContent.value = selectedFeaturedContent.value?.filter((content: any) => content?.id !== contentId);
  };

  const setOriginalSectionItemIds = (ids: number[]) => {
    originalSectionItemIds.value = new Set(ids);
  };

  const $resetAll = () => {
    resetLandingSectionForm();
    sectionContent.value = [];
    sectionDescription.value = '';
    sectionType.value = null;
    sectionPlaylist.value = null;
    featuredContentType.value = null;
    selectedFeaturedContent.value = [];
    layoutType.value = { label: 'List', value: 'list' };
    sourceType.value = null;
    sourcePlaylist.value = null;
    sourceTag.value = null;
    originalSectionItemIds.value = new Set();
  };

  return {
    // Form
    landingSectionErrors,
    sectionTitle,
    sectionDescription,
    sectionType,
    sectionPlaylist,
    featuredContentType,
    selectedFeaturedContent,
    layoutType,
    sourceType,
    sourcePlaylist,
    sourceTag,
    sectionContent,
    getLandingSectionForm,
    isLandingSectionValid,
    handleLandingSectionSubmit,
    resetLandingSectionForm,
    setLandingSectionFormValues,

    // Methods
    setSectionContent,
    removeSectionContent,
    setSelectedFeaturedContent,
    removeSelectedFeaturedContent,
    setOriginalSectionItemIds,
    originalSectionItemIds,
    $resetAll,
  };
});
